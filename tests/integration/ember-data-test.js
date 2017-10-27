import { module, test } from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model } from 'ember-cli-mirage';
import { modelFor } from 'ember-cli-mirage/ember-data';

const CustomFriend = Model.extend();
CustomFriend.__isCustom__ = true;

module('Integration | Ember Data', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'development',
      discoverEmberDataModels: true,
      scenarios: {
        default() {}
      },
      models: {
        // Friend exists in dummy/app/models. We want to make sure pre-defined
        // models take precedence
        friend: CustomFriend,
        foo: Model.extend()
      },
      factories: {}
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test(`Ember data models were generated and loaded`, function(assert) {
    let { schema } = this.server;
    let registry = schema._registry;

    assert.ok(registry.foo, 'Pre defined model Foo has been registered');
    assert.ok(registry.address, 'Ember data model Address has been registered');
    assert.ok(registry.contact, 'Ember data model Contact has been registered');
    assert.ok(registry.user, 'Ember data model User has been registered');
    assert.equal(registry.address.foreignKeys.length, 1, 'Ember data model Address has the correct relationships');
  });

  test(`Defined mirage models take precedence over autogenerated ones`, function(assert) {
    let { schema } = this.server;
    let registry = schema._registry;

    assert.ok(registry.friend, 'Model Friend has been registered');
    assert.ok(registry.friend.class.__isCustom__, 'Model Friend is not the autogenerated one');
  });

  test(`It registers namespaced models`, function(assert) {
    let { schema } = this.server;
    let registry = schema._registry;

    assert.ok(registry.friend, 'Model Friend has been registered');
    assert.ok(registry['namespaced/friend'], 'Model Namespaced::Friend has been registered');

    assert.ok(registry.user, 'Ember data pod model User has been registered');
    assert.ok(registry['namespaced/user'], 'Ember data pod model Namespaced::User has been registered');
  });

  test(`Auto generated models can be extended via modelFor`, function(assert) {
    let { schema } = this.server;
    let registry = schema._registry;

    assert.ok(registry.address, 'Ember data model Address has been registered');
    assert.ok(modelFor('address'), 'Ember data model Address is found');
    assert.equal(typeof modelFor('address').extend, 'function', 'Ember data model Address can be extended');
  });

  test(`modelFor is only for auto generated models`, function(assert) {
    assert.notOk(modelFor('friend').__isCustom__, 'Friend model is not the pre defined one');
    assert.throws(() => modelFor('foo'), () => true, 'Pre defined mirage models cannot be found via modelFor');
  });
});
