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
        } catch (__error) {}
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
    } catch (__error) {
      if (this.globalErrorHandler) {
        this.globalErrorHandler(error, eventName, data);
      } else {
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
      } catch (__error) {}
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
      } catch (__error) {}
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
