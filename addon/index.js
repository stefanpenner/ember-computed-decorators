import Ember from 'ember';

const { get } = Ember;

import computed from 'ember-new-computed';

function handleDescriptor(target, key, descriptor) {
  let originalParams = descriptor.__originalParams || [];
  let computedDescriptor;

  if (descriptor.writable) {
    if (typeof descriptor.value === 'object') {
      let value = { };
      if (descriptor.value.get) { value.get = callUserSuppliedGet(originalParams, descriptor.value.get); }
      if (descriptor.value.set) { value.set = callUserSuppliedSet(originalParams, descriptor.value.set); }
      computedDescriptor = value;
    } else {
      computedDescriptor = callUserSuppliedGet(originalParams, descriptor.value);
    }
  } else {
    throw new Error('ember-computed-decorators does not support using getters and setters');
  }

  descriptor.value = computed.apply(null, originalParams.concat(computedDescriptor));

  return descriptor;
}

function callUserSuppliedGet(params, func) {
  return function() {
    let paramValues = params.map(p => get(this, p));

    return func.apply(this, paramValues);
  };
}


function callUserSuppliedSet(params, func) {
  return function(value) {
    let paramValues = params.map(p => get(this, p));
    paramValues.unshift(value);

    return func.apply(this, paramValues);
  };
}

function isDescriptor(item) {
  return item && typeof item === 'object';
}

export default function computedDecorator(...params) {
  // determine if user called as @computed('blah', 'blah') or @computed
  if (isDescriptor(params[params.length - 1])) {
    return handleDescriptor(...arguments);
  } else {
    return function(target, key, descriptor) {
      descriptor.__originalParams = params;

      return handleDescriptor(...arguments);
    };
  }
}

export function readOnly(target, name, descriptor) {
  descriptor.writable = false;
  var value = typeof descriptor === 'object' && descriptor && descriptor.value;

  if (value && typeof value === 'object' && value.isDescriptor) {
    value.readOnly();
  }

  return descriptor;
}

function macroAlias(fn) {
  return function(...params) {
    return function(target, propertyName, descriptor) {
      descriptor.value = fn(...params);
      return descriptor;
    };
  };
}

export var alias = macroAlias(Ember.computed.alias);
export var empty = macroAlias(Ember.computed.empty);
export var notEmpty = macroAlias(Ember.computed.notEmpty);
export var none = macroAlias(Ember.computed.none);
export var not = macroAlias(Ember.computed.not);
export var bool = macroAlias(Ember.computed.bool);
export var match = macroAlias(Ember.computed.match);
export var equal = macroAlias(Ember.computed.equal);
export var gt = macroAlias(Ember.computed.gt);
export var gte = macroAlias(Ember.computed.gte);
export var lt = macroAlias(Ember.computed.lt);
export var lte = macroAlias(Ember.computed.lte);
export var and = macroAlias(Ember.computed.and);
export var or = macroAlias(Ember.computed.or);
export var any = macroAlias(Ember.computed.any);
export var collect = macroAlias(Ember.computed.collect);
export var oneWay = macroAlias(Ember.computed.oneWay);
