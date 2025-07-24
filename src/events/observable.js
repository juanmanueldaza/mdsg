export class Observable {
  constructor(subscribeFunction) {
    this.subscribeFunction = subscribeFunction;
    this.operators = [];
  }

  subscribe(observer) {
    const wrappedObserver = value => {
      let result = value;
      for (const operator of this.operators) {
        result = operator(result);
        if (result === null || result === undefined) return;
      }
      observer(result);
    };

    return this.subscribeFunction(wrappedObserver);
  }

  map(mapper) {
    return new Observable(observer => {
      return this.subscribe(value => {
        try {
          observer(mapper(value));
        } catch {}
      });
    });
  }
  filter(predicate) {
    return new Observable(observer => {
      return this.subscribe(value => {
        if (predicate(value)) {
          observer(value);
        }
      });
    });
  }

  debounce(delay) {
    return new Observable(observer => {
      let timeoutId = null;

      return this.subscribe(value => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          observer(value);
          timeoutId = null;
        }, delay);
      });
    });
  }

  throttle(delay) {
    return new Observable(observer => {
      let lastEmitted = 0;
      let timeoutId = null;

      return this.subscribe(value => {
        const now = Date.now();
        const timeSinceLastEmit = now - lastEmitted;

        if (timeSinceLastEmit >= delay) {
          observer(value);
          lastEmitted = now;
        } else {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          timeoutId = setTimeout(() => {
            observer(value);
            lastEmitted = Date.now();
            timeoutId = null;
          }, delay - timeSinceLastEmit);
        }
      });
    });
  }

  take(count) {
    return new Observable(observer => {
      let taken = 0;
      const unsubscribe = this.subscribe(value => {
        if (taken < count) {
          observer(value);
          taken++;
          if (taken >= count) {
            unsubscribe();
          }
        }
      });
      return unsubscribe;
    });
  }

  flatMap(mapper) {
    return new Observable(observer => {
      const subscriptions = new Set();

      const mainSubscription = this.subscribe(value => {
        try {
          const innerObservable = mapper(value);
          if (
            innerObservable &&
            typeof innerObservable.subscribe === 'function'
          ) {
            const innerSubscription = innerObservable.subscribe(innerValue => {
              observer(innerValue);
            });
            subscriptions.add(innerSubscription);
          }
        } catch {}
      });

      return () => {
        mainSubscription();
        subscriptions.forEach(unsubscribe => {
          try {
            unsubscribe();
          } catch {}
        });
        subscriptions.clear();
      };
    });
  }
  static fromEvent(element, eventType, options = {}) {
    return new Observable(observer => {
      const handler = event => observer(event);
      element.addEventListener(eventType, handler, options);

      return () => {
        element.removeEventListener(eventType, handler, options);
      };
    });
  }
  static fromPromise(promise) {
    return new Observable(observer => {
      promise.then(observer).catch(_error => {});

      return () => {};
    });
  }
  static fromArray(array, interval = 0) {
    return new Observable(observer => {
      let index = 0;
      const emit = () => {
        if (index < array.length) {
          observer(array[index++]);
          if (interval > 0) {
            setTimeout(emit, interval);
          } else {
            emit();
          }
        }
      };

      emit();
      return () => {};
    });
  }
  static interval(interval) {
    return new Observable(observer => {
      let count = 0;
      const intervalId = setInterval(() => {
        observer(count++);
      }, interval);

      return () => clearInterval(intervalId);
    });
  }
  static merge(...observables) {
    return new Observable(observer => {
      const unsubscribes = observables.map(obs => obs.subscribe(observer));
      return () => unsubscribes.forEach(unsub => unsub());
    });
  }
}
export class EventBus {
  constructor() {
    this.subjects = new Map();
    this.globalErrorHandler = null;
  }
  getSubject(eventName) {
    if (!this.subjects.has(eventName)) {
      this.subjects.set(eventName, new Subject());
    }
    return this.subjects.get(eventName);
  }
  emit(eventName, data) {
    const subject = this.getSubject(eventName);
    try {
      subject.next(data);
    } catch (_error) {
      if (this.globalErrorHandler) {
        this.globalErrorHandler(_error, eventName, data);
      } else {
        // Silent fail - no global error handler configured
      }
    }
  }
  on(eventName, observer) {
    return this.getSubject(eventName).subscribe(observer);
  }
  once(eventName, observer) {
    return this.getSubject(eventName).take(1).subscribe(observer);
  }
  clear(eventName) {
    if (this.subjects.has(eventName)) {
      this.subjects.get(eventName).complete();
      this.subjects.delete(eventName);
    }
  }
  clearAll() {
    this.subjects.forEach(subject => subject.complete());
    this.subjects.clear();
  }
  setErrorHandler(handler) {
    this.globalErrorHandler = handler;
  }
  getStats() {
    return {
      activeEvents: this.subjects.size,
      events: Array.from(this.subjects.keys()),
      totalSubscriptions: Array.from(this.subjects.values()).reduce(
        (total, subject) => total + subject.observerCount,
        0,
      ),
    };
  }
}
export class Subject extends Observable {
  constructor() {
    super(observer => {
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    });

    this.observers = new Set();
    this.completed = false;
    this.observerCount = 0;
  }
  next(value) {
    if (this.completed) return;

    this.observers.forEach(observer => {
      try {
        observer(value);
      } catch {}
    });
  }
  complete() {
    this.completed = true;
    this.observers.clear();
  }
  subscribe(observer) {
    if (this.completed) return () => {};

    this.observers.add(observer);
    this.observerCount++;

    return () => {
      this.observers.delete(observer);
      this.observerCount--;
    };
  }
}
export class EventManager {
  constructor() {
    this.subscriptions = new Set();
    this.elementWeakMap = new WeakMap();
  }
  fromElement(element, eventType, options = {}) {
    const observable = Observable.fromEvent(element, eventType, options);

    if (!this.elementWeakMap.has(element)) {
      this.elementWeakMap.set(element, new Set());
    }
    this.elementWeakMap.get(element).add({ eventType, options });

    return observable;
  }
  addSubscription(unsubscribe) {
    this.subscriptions.add(unsubscribe);
  }
  cleanup() {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch {}
    });
    this.subscriptions.clear();
  }
  getStats() {
    return {
      activeSubscriptions: this.subscriptions.size,
      trackedElements: this.elementWeakMap.size || 'WeakMap size not available',
    };
  }
}

export const eventBus = new EventBus();
export const eventManager = new EventManager();

export const fromClick = element => Observable.fromEvent(element, 'click');
export const fromInput = element => Observable.fromEvent(element, 'input');
export const fromChange = element => Observable.fromEvent(element, 'change');
export const fromKeydown = element => Observable.fromEvent(element, 'keydown');
export const fromSubmit = element => Observable.fromEvent(element, 'submit');

export const debouncedInput = (element, delay = 300) =>
  fromInput(element)
    .debounce(delay)
    .map(e => e.target.value);

export const throttledScroll = (element, delay = 100) =>
  Observable.fromEvent(element, 'scroll').throttle(delay);

export const keyboardShortcuts = element =>
  fromKeydown(element).filter(e => e.ctrlKey || e.metaKey);
