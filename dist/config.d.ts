/// <reference types="node" />
/// <reference types="request" />
import https = require('https');
import request = require('request');
import api = require('./api');
import { Cluster, Context, User } from './config_types';
export declare class KubeConfig {
    static findObject(list: any[], name: string, key: string): any;
    /**
     * The list of all known clusters
     */
    'clusters': Cluster[];
    /**
     * The list of all known users
     */
    'users': User[];
    /**
     * The list of all known contexts
     */
    'contexts': Context[];
    /**
     * The name of the current context
     */
    'currentContext': string;
    getContexts(): Context[];
    getClusters(): Cluster[];
    getUsers(): User[];
    getCurrentContext(): string;
    setCurrentContext(context: string): void;
    getContextObject(name: string): any;
    getCurrentCluster(): Cluster;
    getCluster(name: string): Cluster;
    getCurrentUser(): User;
    getUser(name: string): User;
    loadFromFile(file: string): void;
    applytoHTTPSOptions(opts: https.RequestOptions): void;
    applyToRequest(opts: request.Options): void;
    loadFromString(config: string): void;
    loadFromOptions(options: any): void;
    loadFromClusterAndUser(cluster: Cluster, user: User): void;
    loadFromCluster(): void;
    loadFromDefault(): void;
    makeApiClient<T extends ApiType>(apiClientType: {
        new (server: string): T;
    }): T;
    private getCurrentContextObject();
    private bufferFromFileOrString(file, data);
    private applyHTTPSOptions(opts);
    private applyAuthorizationHeader(opts);
    private applyOptions(opts);
}
export interface ApiType {
    setDefaultAuthentication(config: KubeConfig): any;
}
export declare class Config {
    static SERVICEACCOUNT_ROOT: string;
    static SERVICEACCOUNT_CA_PATH: string;
    static SERVICEACCOUNT_TOKEN_PATH: string;
    static fromFile(filename: string): api.Core_v1Api;
    static fromCluster(): api.Core_v1Api;
    static defaultClient(): api.Core_v1Api;
}
