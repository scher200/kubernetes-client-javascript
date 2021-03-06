"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const chai_1 = require("chai");
const mockfs = require("mock-fs");
const api_1 = require("./api");
const config_1 = require("./config");
const config_types_1 = require("./config_types");
const kcFileName = 'testdata/kubeconfig.yaml';
/* tslint:disable: no-empty */
describe('Config', () => { });
function validateFileLoad(kc) {
    // check clusters
    chai_1.expect(kc.clusters.length).to.equal(2, 'there are 2 clusters');
    const cluster1 = kc.clusters[0];
    const cluster2 = kc.clusters[1];
    chai_1.expect(cluster1.name).to.equal('cluster1');
    chai_1.expect(cluster1.caData).to.equal('Q0FEQVRB');
    chai_1.expect(cluster1.server).to.equal('http://example.com');
    chai_1.expect(cluster2.name).to.equal('cluster2');
    chai_1.expect(cluster2.caData).to.equal('Q0FEQVRBMg==');
    chai_1.expect(cluster2.server).to.equal('http://example2.com');
    chai_1.expect(cluster2.skipTLSVerify).to.equal(true);
    // check users
    chai_1.expect(kc.users.length).to.equal(2, 'there are 2 users');
    const user1 = kc.users[0];
    const user2 = kc.users[1];
    chai_1.expect(user1.name).to.equal('user1');
    chai_1.expect(user1.certData).to.equal('VVNFUl9DQURBVEE=');
    chai_1.expect(user1.keyData).to.equal('VVNFUl9DS0RBVEE=');
    chai_1.expect(user2.name).to.equal('user2');
    chai_1.expect(user2.certData).to.equal('VVNFUjJfQ0FEQVRB');
    chai_1.expect(user2.keyData).to.equal('VVNFUjJfQ0tEQVRB');
    // check contexts
    chai_1.expect(kc.contexts.length).to.equal(2, 'there are two contexts');
    const context1 = kc.contexts[0];
    const context2 = kc.contexts[1];
    chai_1.expect(context1.name).to.equal('context1');
    chai_1.expect(context1.user).to.equal('user1');
    chai_1.expect(context1.cluster).to.equal('cluster1');
    chai_1.expect(context2.name).to.equal('context2');
    chai_1.expect(context2.user).to.equal('user2');
    chai_1.expect(context2.cluster).to.equal('cluster2');
    chai_1.expect(kc.getCurrentContext()).to.equal('context2');
}
describe('KubeConfig', () => {
    describe('findObject', () => {
        it('should find objects', () => {
            const list = [
                {
                    name: 'foo',
                    cluster: {
                        some: 'sub-object',
                    },
                    some: 'object',
                },
                {
                    name: 'bar',
                    some: 'object',
                    cluster: {
                        sone: 'sub-object',
                    },
                },
            ];
            // Validate that if the named object ('cluster' in this case) is inside we pick it out
            const obj1 = config_1.KubeConfig.findObject(list, 'foo', 'cluster');
            chai_1.expect(obj1.some).to.equal('sub-object');
            // Validate that if the named object is missing, we just return the full object
            const obj2 = config_1.KubeConfig.findObject(list, 'bar', 'context');
            chai_1.expect(obj2.some).to.equal('object');
            // validate that we do the right thing if it is missing
            const obj3 = config_1.KubeConfig.findObject(list, 'nonexistent', 'context');
            chai_1.expect(obj3).to.equal(null);
        });
    });
    describe('loadFromClusterAndUser', () => {
        it('should load from cluster and user', () => {
            const kc = new config_1.KubeConfig();
            const cluster = {
                name: 'foo',
                server: 'http://server.com',
            };
            const user = {
                name: 'my-user',
                password: 'some-password',
            };
            kc.loadFromClusterAndUser(cluster, user);
            const clusterOut = kc.getCurrentCluster();
            chai_1.expect(clusterOut).to.equal(cluster);
            const userOut = kc.getCurrentUser();
            chai_1.expect(userOut).to.equal(user);
        });
    });
    describe('clusterConstructor', () => {
        it('should load from options', () => {
            const cluster = {
                name: 'foo',
                server: 'http://server.com',
            };
            const user = {
                name: 'my-user',
                password: 'some-password',
            };
            const context = {
                name: 'my-context',
                user: user.name,
                cluster: cluster.name,
            };
            const kc = new config_1.KubeConfig();
            kc.loadFromOptions({
                clusters: [cluster],
                users: [user],
                contexts: [context],
                currentContext: context.name,
            });
            const clusterOut = kc.getCurrentCluster();
            chai_1.expect(clusterOut).to.equal(cluster);
            const userOut = kc.getCurrentUser();
            chai_1.expect(userOut).to.equal(user);
        });
    });
    describe('loadFromString', () => {
        it('should throw with a bad version', () => {
            const kc = new config_1.KubeConfig();
            chai_1.expect(() => kc.loadFromString('apiVersion: v2')).to.throw('unknown version: v2');
        });
    });
    describe('loadFromFile', () => {
        it('should load the kubeconfig file properly', () => {
            const kc = new config_1.KubeConfig();
            kc.loadFromFile(kcFileName);
            validateFileLoad(kc);
        });
        it('should fail to load a missing kubeconfig file', () => {
            // TODO: make the error check work
            // let kc = new KubeConfig();
            // expect(kc.loadFromFile("missing.yaml")).to.throw();
        });
    });
    describe('applyHTTPSOptions', () => {
        it('should apply cert configs', () => {
            const kc = new config_1.KubeConfig();
            kc.loadFromFile(kcFileName);
            const opts = {};
            kc.applytoHTTPSOptions(opts);
            chai_1.expect(opts).to.deep.equal({
                ca: new Buffer('CADATA2', 'utf-8'),
                cert: new Buffer('USER2_CADATA', 'utf-8'),
                key: new Buffer('USER2_CKDATA', 'utf-8'),
            });
        });
    });
    describe('loadClusterConfigObjects', () => {
        it('should fail if name is missing from cluster', () => {
            chai_1.expect(() => {
                config_types_1.newClusters([
                    {
                        name: 'some-cluster',
                        cluster: {
                            server: 'some.server.com',
                        },
                    },
                    {
                        foo: 'bar',
                    },
                ]);
            }).to.throw('clusters[1].name is missing');
        });
        it('should fail if cluster is missing from cluster', () => {
            chai_1.expect(() => {
                config_types_1.newClusters([
                    {
                        name: 'some-cluster',
                        cluster: {
                            server: 'some.server.com',
                        },
                    },
                    {
                        name: 'bar',
                    },
                ]);
            }).to.throw('clusters[1].cluster is missing');
        });
        it('should fail if cluster.server is missing from cluster', () => {
            chai_1.expect(() => {
                config_types_1.newClusters([
                    {
                        name: 'some-cluster',
                        cluster: {
                            server: 'some.server.com',
                        },
                    },
                    {
                        name: 'bar',
                        cluster: {},
                    },
                ]);
            }).to.throw('clusters[1].cluster.server is missing');
        });
    });
    describe('loadUserConfigObjects', () => {
        it('should fail if name is missing from user', () => {
            chai_1.expect(() => {
                config_types_1.newUsers([
                    {
                        name: 'some-user',
                        user: {},
                    },
                    {
                        foo: 'bar',
                    },
                ]);
            }).to.throw('users[1].name is missing');
        });
        it('should load correctly with just name', () => {
            const name = 'some-name';
            const users = config_types_1.newUsers([
                {
                    name,
                },
            ]);
            chai_1.expect(name).to.equal(users[0].name);
        });
        it('should load token correctly', () => {
            const name = 'some-name';
            const token = 'token';
            const users = config_types_1.newUsers([
                {
                    name,
                    user: {
                        token: 'token',
                    },
                },
            ]);
            chai_1.expect(name).to.equal(users[0].name);
            chai_1.expect(token).to.equal(users[0].token);
        });
        it('should load token file correctly', () => {
            const name = 'some-name';
            const token = 'token-file-data';
            mockfs({
                '/path/to/fake/dir': {
                    'token.txt': token,
                },
            });
            const users = config_types_1.newUsers([
                {
                    name,
                    user: {
                        'token-file': '/path/to/fake/dir/token.txt',
                    },
                },
            ]);
            mockfs.restore();
            chai_1.expect(name).to.equal(users[0].name);
            chai_1.expect(token).to.equal(users[0].token);
        });
        it('should load extra auth stuff correctly', () => {
            const authProvider = 'authProvider';
            const certData = 'certData';
            const certFile = 'certFile';
            const keyData = 'keyData';
            const keyFile = 'keyFile';
            const password = 'password';
            const username = 'username';
            const name = 'some-name';
            const users = config_types_1.newUsers([
                {
                    name,
                    user: {
                        'auth-provider': authProvider,
                        'client-certificate-data': certData,
                        'client-certificate': certFile,
                        'client-key-data': keyData,
                        'client-key': keyFile,
                        'password': password,
                        'username': username,
                    },
                },
            ]);
            chai_1.expect(authProvider).to.equal(users[0].authProvider);
            chai_1.expect(certData).to.equal(users[0].certData);
            chai_1.expect(certFile).to.equal(users[0].certFile);
            chai_1.expect(keyData).to.equal(users[0].keyData);
            chai_1.expect(keyFile).to.equal(users[0].keyFile);
            chai_1.expect(password).to.equal(users[0].password);
            chai_1.expect(username).to.equal(users[0].username);
            chai_1.expect(name).to.equal(users[0].name);
        });
    });
    describe('loadContextConfigObjects', () => {
        it('should fail if name is missing from context', () => {
            chai_1.expect(() => {
                config_types_1.newContexts([
                    {
                        name: 'some-cluster',
                        context: {
                            cluster: 'foo',
                            user: 'bar',
                        },
                    },
                    {
                        foo: 'bar',
                    },
                ]);
            }).to.throw('contexts[1].name is missing');
        });
        it('should fail if context is missing from context', () => {
            chai_1.expect(() => {
                config_types_1.newContexts([
                    {
                        name: 'some-cluster',
                        context: {
                            cluster: 'foo',
                            user: 'bar',
                        },
                    },
                    {
                        name: 'bar',
                    },
                ]);
            }).to.throw('contexts[1].context is missing');
        });
        it('should fail if user is missing from context', () => {
            chai_1.expect(() => {
                config_types_1.newContexts([
                    {
                        name: 'some-cluster',
                        context: {
                            cluster: 'foo',
                            user: 'bar',
                        },
                    },
                    {
                        name: 'bar',
                        context: {
                            cluster: 'baz',
                        },
                    },
                ]);
            }).to.throw('contexts[1].context.user is missing');
        });
        it('should fail if context is missing from context', () => {
            chai_1.expect(() => {
                config_types_1.newContexts([
                    {
                        name: 'some-cluster',
                        context: {
                            cluster: 'foo',
                            user: 'bar',
                        },
                    },
                    {
                        name: 'bar',
                        context: {
                            user: 'user',
                        },
                    },
                ]);
            }).to.throw('contexts[1].context.cluster is missing');
        });
    });
    describe('auth options', () => {
        it('should populate basic-auth for https', () => {
            const config = new config_1.KubeConfig();
            const user = 'user';
            const passwd = 'password';
            config.loadFromClusterAndUser({}, { username: user, password: passwd });
            const opts = {};
            config.applytoHTTPSOptions(opts);
            chai_1.expect(opts.auth).to.equal(`${user}:${passwd}`);
        });
        it('should populate options for request', () => {
            const config = new config_1.KubeConfig();
            const user = 'user';
            const passwd = 'password';
            config.loadFromClusterAndUser({
                skipTLSVerify: true,
            }, {
                username: user,
                password: passwd,
            });
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.auth.username).to.equal(user);
            chai_1.expect(opts.auth.password).to.equal(passwd);
            chai_1.expect(opts.strictSSL).to.equal(false);
        });
        it('should not populate strict ssl', () => {
            const config = new config_1.KubeConfig();
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {});
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.strictSSL).to.equal(undefined);
        });
        it('should populate from token', () => {
            const config = new config_1.KubeConfig();
            const token = 'token';
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                token,
            });
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.headers.Authorization).to.equal(`Bearer ${token}`);
        });
        it('should populate from auth provider', () => {
            const config = new config_1.KubeConfig();
            const token = 'token';
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                authProvider: {
                    config: {
                        'access-token': token,
                        'expiry': 'Fri Aug 24 07:32:05 PDT 3018',
                    },
                },
            });
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.headers.Authorization).to.equal(`Bearer ${token}`);
            opts.headers = [];
            opts.headers.Host = 'foo.com';
            config.applyToRequest(opts);
            chai_1.expect(opts.headers.Authorization).to.equal(`Bearer ${token}`);
        });
        it('should populate from auth provider without expirty', () => {
            const config = new config_1.KubeConfig();
            const token = 'token';
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                authProvider: {
                    config: {
                        'access-token': token,
                    },
                },
            });
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.headers.Authorization).to.equal(`Bearer ${token}`);
        });
        it('should throw with expired token and no cmd', () => {
            const config = new config_1.KubeConfig();
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                authProvider: {
                    config: {
                        expiry: 'Aug 24 07:32:05 PDT 2017',
                    },
                },
            });
            const opts = {};
            chai_1.expect(() => config.applyToRequest(opts)).to.throw('Token is expired!');
        });
        it('should throw with bad command', () => {
            const config = new config_1.KubeConfig();
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                authProvider: {
                    config: {
                        'expiry': 'Aug 24 07:32:05 PDT 2017',
                        'cmd-path': 'non-existent-command',
                    },
                },
            });
            const opts = {};
            chai_1.expect(() => config.applyToRequest(opts)).to.throw('Failed to refresh token: /bin/sh: 1: non-existent-command: not found');
        });
        it('should exec with expired token', () => {
            const config = new config_1.KubeConfig();
            const token = 'token';
            const responseStr = `{ "token": { "accessToken": "${token}" } }`;
            config.loadFromClusterAndUser({ skipTLSVerify: false }, {
                authProvider: {
                    config: {
                        'expiry': 'Aug 24 07:32:05 PDT 2017',
                        'cmd-path': 'echo',
                        'cmd-args': `'${responseStr}'`,
                        'token-key': '{.token.accessToken}',
                    },
                },
            });
            const opts = {};
            config.applyToRequest(opts);
            chai_1.expect(opts.headers.Authorization).to.equal(`Bearer ${token}`);
        });
    });
    describe('loadFromDefault', () => {
        it('should load from $KUBECONFIG', () => {
            process.env.KUBECONFIG = kcFileName;
            const kc = new config_1.KubeConfig();
            kc.loadFromDefault();
            delete process.env.KUBECONFIG;
            validateFileLoad(kc);
        });
        it('should load from $HOME/.kube/config', () => {
            const currentHome = process.env.HOME;
            process.env.HOME = 'foobar';
            const data = fs_1.readFileSync(kcFileName);
            const dir = path_1.join(process.env.HOME, '.kube');
            const arg = {};
            arg[dir] = { config: data };
            mockfs(arg);
            const kc = new config_1.KubeConfig();
            kc.loadFromDefault();
            mockfs.restore();
            process.env.HOME = currentHome;
            validateFileLoad(kc);
        });
        it('should load from cluster', () => {
            const token = 'token';
            const cert = 'cert';
            mockfs({
                '/var/run/secrets/kubernetes.io/serviceaccount': {
                    'ca.crt': cert,
                    'token': token,
                },
            });
            process.env.KUBERNETES_SERVICE_HOST = 'kubernetes';
            process.env.KUBERNETES_SERVICE_PORT = '443';
            const kc = new config_1.KubeConfig();
            kc.loadFromDefault();
            mockfs.restore();
            delete process.env.KUBERNETES_SERVICE_HOST;
            delete process.env.KUBERNETES_SERVICE_PORT;
            chai_1.expect(kc.getCurrentCluster().caFile).to.equal('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
            chai_1.expect(kc.getCurrentCluster().server).to.equal('https://kubernetes:443');
            chai_1.expect(kc.getCurrentUser().token).to.equal(token);
        });
        it('should load from cluster with http port', () => {
            const token = 'token';
            const cert = 'cert';
            mockfs({
                '/var/run/secrets/kubernetes.io/serviceaccount': {
                    'ca.crt': cert,
                    'token': token,
                },
            });
            process.env.KUBERNETES_SERVICE_HOST = 'kubernetes';
            process.env.KUBERNETES_SERVICE_PORT = '80';
            const kc = new config_1.KubeConfig();
            kc.loadFromDefault();
            mockfs.restore();
            delete process.env.KUBERNETES_SERVICE_HOST;
            delete process.env.KUBERNETES_SERVICE_PORT;
            chai_1.expect(kc.getCurrentCluster().server).to.equal('http://kubernetes:80');
        });
        it('should default to localhost', () => {
            const currentHome = process.env.HOME;
            process.env.HOME = '/non/existent';
            const kc = new config_1.KubeConfig();
            kc.loadFromDefault();
            process.env.HOME = currentHome;
            chai_1.expect(kc.getCurrentUser().name).to.equal('user');
            chai_1.expect(kc.getCurrentCluster().server).to.equal('http://localhost:8080');
        });
    });
    describe('makeAPIClient', () => {
        it('should be able to make an api client', () => {
            const kc = new config_1.KubeConfig();
            kc.loadFromFile(kcFileName);
            const client = kc.makeApiClient(api_1.Core_v1Api);
            chai_1.expect(client instanceof api_1.Core_v1Api).to.equal(true);
        });
    });
});
//# sourceMappingURL=config_test.js.map