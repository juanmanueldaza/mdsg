import {
  Observable,
  eventBus,
  eventManager,
  fromClick,
  // fromInput, // TODO: Implement input handling
  fromKeydown,
  debouncedInput,
  keyboardShortcuts,
} from '@observable';

export class EventHandlerService {
  constructor(
    authService,
    gitHubService,
    deploymentService,
    contentState,
    uiManager,
  ) {
    this.authService = authService;
    this.gitHubService = gitHubService;
    this.deploymentService = deploymentService;
    this.contentState = contentState;
    this.uiManager = uiManager;

    this.subscriptions = new Set();
    this.eventStreams = new Map();
    this.initialized = false;

    this.stats = {
      eventsRegistered: 0,
      eventsTriggered: 0,
      lastEventTime: null,
    };
  }

  initialize(container = document) {
    console.log('🚀 EventHandler initialize called, container:', container);
    if (this.initialized) {
      console.log('⚠️ Already initialized, skipping');
      return;
    }

    this.setupAuthenticationEvents(container);
    this.setupEditorEvents(container);
    this.setupNavigationEvents(container);
    this.setupDeploymentEvents(container);
    this.setupKeyboardShortcuts(container);
    this.setupGlobalEvents();

    this.initialized = true;
    this.stats.eventsRegistered = this.subscriptions.size;
  }

  setupAuthenticationEvents(container) {
    const loginBtn = container.querySelector('#login-btn');
    if (loginBtn) {
      const loginStream = fromClick(loginBtn).map(() => ({
        type: 'auth.login.requested',
        timestamp: Date.now(),
      }));

      this.subscriptions.add(
        loginStream.subscribe(event => {
          this.trackEvent(event.type);
          eventBus.emit('auth.login.start', event);
          // Call the UI manager's loginWithGitHub method
          if (
            this.uiManager &&
            typeof this.uiManager.loginWithGitHub === 'function'
          ) {
            this.uiManager.loginWithGitHub();
          }
        }),
      );
    }

    const demoBtn = container.querySelector('#demo-btn');
    if (demoBtn) {
      const demoStream = fromClick(demoBtn).map(() => ({
        type: 'auth.demo.requested',
        timestamp: Date.now(),
      }));

      this.subscriptions.add(
        demoStream.subscribe(event => {
          this.trackEvent(event.type);
          eventBus.emit('auth.demo.start', event);
          this.authService.setDemoMode();
          this.uiManager.showMainInterface();
        }),
      );
    }

    const tokenInput = container.querySelector('#token-input');
    if (tokenInput) {
      const tokenStream = debouncedInput(tokenInput, 500)
        .filter(value => value.length > 10)
        .map(value => ({
          type: 'auth.token.changed',
          token: value,
          timestamp: Date.now(),
        }));

      this.subscriptions.add(
        tokenStream.subscribe(event => {
          this.trackEvent(event.type);
          eventBus.emit('auth.token.validate', event);
        }),
      );
    }

    const saveTokenBtn = container.querySelector('#save-token');
    if (saveTokenBtn) {
      this.subscriptions.add(
        fromClick(saveTokenBtn).subscribe(() => {
          this.trackEvent('auth.token.save');
          // Call the UI manager's savePersonalToken method
          if (
            this.uiManager &&
            typeof this.uiManager.savePersonalToken === 'function'
          ) {
            this.uiManager.savePersonalToken();
          }
        }),
      );
    }

    const cancelTokenBtn = container.querySelector('#cancel-token');
    if (cancelTokenBtn) {
      this.subscriptions.add(
        fromClick(cancelTokenBtn).subscribe(() => {
          this.trackEvent('auth.token.cancel');
          eventBus.emit('auth.token.cancel', { timestamp: Date.now() });
          if (this.uiManager.showWelcomeScreen) {
            this.uiManager.showWelcomeScreen();
          }
        }),
      );
    }

    if (tokenInput) {
      const enterKeyStream = fromKeydown(tokenInput)
        .filter(e => e.key === 'Enter')
        .map(_e => ({ type: 'auth.token.enter', timestamp: Date.now() }));

      this.subscriptions.add(
        enterKeyStream.subscribe(_event => {
          this.trackEvent('auth.token.enter');
          // Call the UI manager's savePersonalToken method for Enter key
          if (
            this.uiManager &&
            typeof this.uiManager.savePersonalToken === 'function'
          ) {
            this.uiManager.savePersonalToken();
          }
        }),
      );
    }

    const logoutBtn = container.querySelector('#logout-btn');
    if (logoutBtn) {
      this.subscriptions.add(
        fromClick(logoutBtn).subscribe(() => {
          this.trackEvent('auth.logout');
          eventBus.emit('auth.logout.requested', { timestamp: Date.now() });
          this.authService.logout();
          this.uiManager.showWelcomeScreen();
        }),
      );
    }
  }

  setupEditorEvents(container) {
    console.log('🔍 setupEditorEvents called, container:', container);
    const editor = container.querySelector('#markdown-editor');
    console.log('📝 Editor found:', editor ? '✅ YES' : '❌ NO');
    if (!editor) return;

    const contentStream = debouncedInput(editor, 300).map(content => ({
      type: 'editor.content.changed',
      content,
      wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
      timestamp: Date.now(),
    }));

    this.subscriptions.add(
      contentStream.subscribe(event => {
        console.log('⚡ contentStream event:', event.content?.substring(0, 50));
        this.trackEvent(event.type);
        this.contentState.setContent(event.content);
        eventBus.emit('content.updated', event);

        eventBus.emit('preview.update.requested', event);
        eventBus.emit('autosave.requested', event);
      }),
    );

    const validationStream = contentStream
      .debounce(500)
      .map(event => ({ ...event, type: 'editor.validation.requested' }));

    this.subscriptions.add(
      validationStream.subscribe(event => {
        this.trackEvent(event.type);
        eventBus.emit('content.validate', event);
      }),
    );

    const shortcutStream = keyboardShortcuts(editor).map(e => ({
      type: 'editor.shortcut.triggered',
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      event: e,
    }));

    this.subscriptions.add(
      shortcutStream.subscribe(event => {
        this.trackEvent(event.type);
        this.handleEditorShortcut(event);
      }),
    );

    const tabStream = fromKeydown(editor)
      .filter(e => e.key === 'Tab')
      .map(e => ({
        type: 'editor.tab.pressed',
        event: e,
        timestamp: Date.now(),
      }));

    this.subscriptions.add(
      tabStream.subscribe(event => {
        this.trackEvent(event.type);
        this.handleTabInsertion(event.event);
      }),
    );
  }

  setupNavigationEvents(container) {
    const navButtons = container.querySelectorAll('[data-nav]');

    const navStream = Observable.fromArray(Array.from(navButtons)).flatMap(
      button =>
        fromClick(button).map(e => ({
          type: 'navigation.tab.clicked',
          tab: button.dataset.nav,
          timestamp: Date.now(),
          event: e,
        })),
    );

    this.subscriptions.add(
      navStream.subscribe(event => {
        this.trackEvent(event.type);
        this.handleTabNavigation(event.tab);
      }),
    );

    const hashStream = Observable.fromEvent(window, 'hashchange').map(() => ({
      type: 'navigation.hash.changed',
      hash: window.location.hash,
      timestamp: Date.now(),
    }));

    this.subscriptions.add(
      hashStream.subscribe(event => {
        this.trackEvent(event.type);
        this.handleHashNavigation(event.hash);
      }),
    );

    const backButtonStream = Observable.fromEvent(window, 'popstate').map(
      e => ({
        type: 'navigation.back.pressed',
        state: e.state,
        timestamp: Date.now(),
      }),
    );

    this.subscriptions.add(
      backButtonStream.subscribe(event => {
        this.trackEvent(event.type);
        this.handleBackNavigation(event.state);
      }),
    );
  }

  setupDeploymentEvents(container) {
    console.log('🚀 setupDeploymentEvents called, container:', container);

    // Support multiple deploy buttons with different IDs
    const deploySelectors = [
      '#main-deploy-btn',
      '#form-deploy-btn',
      '#editor-deploy-btn',
    ];
    let deployBtn = null;

    for (const selector of deploySelectors) {
      deployBtn = container.querySelector(selector);
      if (deployBtn) {
        console.log('📤 Deploy button found:', selector, '✅ YES');
        break;
      }
    }

    if (!deployBtn) {
      console.log(
        '❌ No deploy button found with any selector:',
        deploySelectors,
      );
      return;
    }

    const deployStream = fromClick(deployBtn)
      .map(() => {
        try {
          console.log('🎯 Deploy button CLICKED! Creating event...');
          console.log('🔍 Checking auth service:', this.authService);
          console.log(
            '🔍 Auth service methods:',
            Object.getOwnPropertyNames(this.authService),
          );

          const isAuth = this.authService.isAuthenticated();
          console.log('🔍 Authentication check result:', isAuth);

          // Get content directly from editor first, then try content state as fallback
          const editor = document.querySelector('#markdown-editor');
          const editorContent = editor?.value || '';
          console.log(
            '🔍 Direct editor content:',
            editorContent?.length,
            'characters',
          );
          console.log('🔍 Direct editor raw:', JSON.stringify(editorContent));

          let content = editorContent;

          // Try to get content from state as fallback (with error handling)
          try {
            if (
              this.contentState &&
              typeof this.contentState.getContent === 'function'
            ) {
              const stateContent = this.contentState.getContent();
              console.log(
                '🔍 Content state check:',
                stateContent?.length,
                'characters',
              );
              console.log(
                '🔍 Raw content from state:',
                JSON.stringify(stateContent),
              );
              // Use state content if editor is empty but state has content
              if (!content && stateContent) {
                content = stateContent;
              }
            } else {
              console.log(
                '⚠️ Content state not available or getContent not a function',
              );
            }
          } catch (error) {
            console.log('⚠️ Error accessing content state:', error);
          }

          const event = {
            type: 'deployment.requested',
            content,
            authenticated: isAuth,
            timestamp: Date.now(),
          };
          console.log('📋 Event created successfully:', event);
          return event;
        } catch (error) {
          console.error('❌ Error in deploy button map:', error);
          throw error;
        }
      })
      .filter(event => {
        console.log(
          '🔍 Deploy validation - Content length:',
          event.content?.length,
          'Auth:',
          event.authenticated,
        );
        console.log(
          '🔍 Deploy validation - Content preview:',
          event.content?.substring(0, 50),
        );

        if (!event.content || !event.content.trim()) {
          console.log('❌ Deploy failed: No content');
          eventBus.emit('deployment.error', {
            error: 'No content to deploy',
            type: 'validation_error',
          });
          return false;
        }

        if (!event.authenticated) {
          console.log('❌ Deploy failed: Not authenticated');
          eventBus.emit('deployment.error', {
            error: 'Authentication required',
            type: 'auth_error',
          });
          return false;
        }

        console.log('✅ Deploy validation passed - proceeding to deployment');
        return true;
      });

    this.subscriptions.add(
      deployStream.subscribe(async event => {
        console.log('🚀 Deploy button clicked! Event:', event);
        this.trackEvent(event.type);
        eventBus.emit('deployment.start', event);

        try {
          console.log('📦 Starting deployment process...');

          // Generate a repository name based on content or timestamp
          const timestamp = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');
          const contentHash = event.content
            .substring(0, 10)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
          const repoName = `mdsg-site-${contentHash || timestamp}`;

          console.log('📂 Using repository name:', repoName);

          const result = await this.deploymentService.deployToGitHubPages(
            event.content,
            repoName,
          );
          console.log('✅ Deployment successful:', result);
          eventBus.emit('deployment.success', {
            result,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error('❌ Deployment failed:', error);
          eventBus.emit('deployment.error', {
            error: error.message || 'Deployment failed',
            timestamp: Date.now(),
          });
        }
      }),
    );

    const createAnotherBtn = container.querySelector('#create-another');
    if (createAnotherBtn) {
      this.subscriptions.add(
        fromClick(createAnotherBtn).subscribe(() => {
          this.trackEvent('deployment.create_another');
          eventBus.emit('deployment.new.requested', { timestamp: Date.now() });
          this.uiManager.resetForNewSite();
        }),
      );
    }
  }

  setupKeyboardShortcuts(_container) {
    const globalShortcuts = keyboardShortcuts(document).map(e => ({
      type: 'shortcut.global',
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      event: e,
    }));

    this.subscriptions.add(
      globalShortcuts.subscribe(event => {
        this.handleGlobalShortcut(event);
      }),
    );
  }

  setupGlobalEvents() {
    const errorStream = Observable.fromEvent(window, 'error')
      .map(event => ({
        type: 'global.error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        error: event.error,
        timestamp: Date.now(),
      }))
      .filter(event => {
        return (
          !event.filename?.includes('extension://') &&
          !event.filename?.includes('chrome-extension://') &&
          !event.filename?.includes('moz-extension://')
        );
      });

    this.subscriptions.add(
      errorStream.subscribe(event => {
        this.trackEvent(event.type);
        eventBus.emit('global.error', event);
        this.handleGlobalError(event);
      }),
    );

    this.subscriptions.add(
      Observable.fromEvent(window, 'beforeunload').subscribe(() => {
        this.cleanup();
      }),
    );
  }

  handleEditorShortcut(event) {
    const { key, event: originalEvent } = event;

    switch (key) {
      case 's':
        originalEvent.preventDefault();
        eventBus.emit('autosave.force', event);
        break;

      case 'b':
        originalEvent.preventDefault();
        eventBus.emit('editor.format.bold', event);
        this.insertMarkdown('**', '**', 'bold text');
        break;

      case 'i':
        originalEvent.preventDefault();
        eventBus.emit('editor.format.italic', event);
        this.insertMarkdown('*', '*', 'italic text');
        break;

      case 'k':
        originalEvent.preventDefault();
        eventBus.emit('editor.format.link', event);
        this.insertMarkdown('[', '](url)', 'link text');
        break;
    }
  }

  handleTabInsertion(event) {
    event.preventDefault();

    const editor = event.target;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value = `${editor.value.substring(0, start)}    ${editor.value.substring(end)}`;

    editor.selectionStart = editor.selectionEnd = start + 4;

    eventBus.emit('content.updated', {
      type: 'editor.content.changed',
      content: editor.value,
      wordCount: editor.value.split(/\s+/).filter(w => w.length > 0).length,
      timestamp: Date.now(),
    });
  }

  handleGlobalShortcut(event) {
    const { key, event: originalEvent } = event;

    switch (key) {
      case 'n':
        if (originalEvent.ctrlKey || originalEvent.metaKey) {
          originalEvent.preventDefault();
          eventBus.emit('navigation.new.requested', event);
          this.contentState.clearContent();
        }
        break;

      case 'p':
        if (originalEvent.ctrlKey || originalEvent.metaKey) {
          originalEvent.preventDefault();
          eventBus.emit('preview.toggle.requested', event);
          this.uiManager.togglePreviewMode();
        }
        break;
    }
  }

  handleGlobalError(_event) {
    this.uiManager.showErrorMessage(
      'An unexpected error occurred. Please try refreshing the page.',
      'error',
      5000,
    );
  }

  handleTabNavigation(tab) {
    eventBus.emit('navigation.tab.changed', { tab, timestamp: Date.now() });
    this.uiManager.switchTab(tab);
  }

  handleHashNavigation(hash) {
    const tab = hash.replace('#', '') || 'editor';
    this.handleTabNavigation(tab);
  }

  handleBackNavigation(state) {
    if (state && state.tab) {
      this.handleTabNavigation(state.tab);
    }
  }

  insertMarkdown(before, after, placeholder) {
    const editor = document.querySelector('#markdown-editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const replacement = selectedText || placeholder;

    const newText = before + replacement + after;
    editor.value =
      editor.value.substring(0, start) + newText + editor.value.substring(end);

    const newCursorPos = start + before.length + replacement.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);

    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  trackEvent(_eventType) {
    this.stats.eventsTriggered++;
    this.stats.lastEventTime = Date.now();
  }

  getStats() {
    return {
      eventsTriggered: this.stats.eventsTriggered,
      lastEventTime: this.stats.lastEventTime,
      subscriptionsActive: this.subscriptions.size,
      streamsRegistered: this.eventStreams.size,
      initialized: this.initialized,
      eventBusStats: eventBus.getStats(),
      managerStats: eventManager.getStats(),
    };
  }

  setupEventStream(selector, eventType, handler, options = {}) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const stream = Observable.fromEvent(element, eventType, options);
    const subscription = stream.subscribe(handler);

    this.subscriptions.add(subscription);
    return subscription;
  }

  registerEventStream(name, observable) {
    this.eventStreams.set(name, observable);
  }

  getEventStream(name) {
    return this.eventStreams.get(name);
  }

  cleanup() {
    console.log(
      '🧹 EventHandler cleanup called, removing',
      this.subscriptions.size,
      'subscriptions',
    );
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {}
    });

    this.subscriptions.clear();
    // DON'T clear the global event bus - other parts of MDSG are using it!
    // eventBus.clearAll(); // ❌ This was breaking the main.js event listeners
    eventManager.cleanup();
    this.eventStreams.clear();

    this.initialized = false;
  }

  reinitialize() {
    console.log('🔄 EventHandler reinitialize called');
    this.cleanup();
    this.initialize();
  }
}

export const MDSG_EVENTS = {
  AUTH_LOGIN_START: 'auth.login.start',
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_ERROR: 'auth.login.error',
  AUTH_DEMO_START: 'auth.demo.start',
  AUTH_TOKEN_VALIDATE: 'auth.token.validate',
  AUTH_LOGOUT: 'auth.logout.requested',

  CONTENT_UPDATED: 'content.updated',
  CONTENT_VALIDATE: 'content.validate',
  CONTENT_CLEAR: 'content.clear.requested',
  CONTENT_SAMPLE: 'content.sample.requested',

  PREVIEW_UPDATE: 'preview.update.requested',
  PREVIEW_MODE_TOGGLE: 'preview.mode.toggle',
  PREVIEW_FULLSCREEN: 'preview.fullscreen.toggle',

  DEPLOYMENT_START: 'deployment.start',
  DEPLOYMENT_PROGRESS: 'deployment.progress',
  DEPLOYMENT_SUCCESS: 'deployment.success',
  DEPLOYMENT_ERROR: 'deployment.error',

  EDITOR_FORMAT_BOLD: 'editor.format.bold',
  EDITOR_FORMAT_ITALIC: 'editor.format.italic',
  EDITOR_FORMAT_LINK: 'editor.format.link',

  GLOBAL_ERROR: 'global.error',
  AUTOSAVE_REQUESTED: 'autosave.requested',
  AUTOSAVE_FORCE: 'autosave.force',
};

export default EventHandlerService;

export { eventBus } from '@observable';
