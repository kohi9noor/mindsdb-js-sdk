import axios from 'axios';

import ModelsModule from './models/modelsModule';
import ProjectsModule from './projects/projectsModule';
import SQLModule from './sql/sqlModule';
import ConnectionOptions from './connectionOptions';
import Constants from './constants';
import { getCookieValue, isMindsDbCloudEndpoint } from './util/http';
import tablesModule from './tables/tablesModule';

const defaultAxiosInstance = axios.create({
  baseURL: Constants.BASE_CLOUD_API_ENDPOINT,
});

const SQL = new SQLModule.SqlRestApiClient(defaultAxiosInstance);
const Models = new ModelsModule.ModelsRestApiClient(SQL);
const Projects = new ProjectsModule.ProjectsRestApiClient(defaultAxiosInstance);
const Tables = new tablesModule.TablesRestApiClient(SQL);

/**
 * Initializes the MindsDB SDK and authenticates the user if needed.
 * @param {ConnectionOptions} options - Options to use for initialization
 */
const connect = async function (options: ConnectionOptions): Promise<void> {
  const httpClient = options.httpClient || defaultAxiosInstance;
  SQL.client = httpClient;
  Projects.client = httpClient;
  const baseURL =
    httpClient.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
  // Need to authenticate if we're using the Cloud API endpoints.
  if (isMindsDbCloudEndpoint(baseURL)) {
    const loginURL = new URL(Constants.BASE_LOGIN_URI, baseURL);
    const loginResponse = await httpClient.post(loginURL.href, {
      email: options.user,
      password: options.password,
    });

    const session = getCookieValue(
      loginResponse.headers['set-cookie'] || [],
      'session'
    );
    SQL.session = session;
    Projects.session = session;
  }
};

export default { connect, SQL, Models, Projects, Tables };
