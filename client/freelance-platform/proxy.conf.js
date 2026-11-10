const identity = {
  target: 'http://127.0.0.1:8001',
  secure: false,
  changeOrigin: true,
};

const tasks = {
  target: 'http://127.0.0.1:8002',
  secure: false,
  changeOrigin: true,
};

const tasksApi = {
  ...tasks,
  bypass(req) {
    const accept = req.headers.accept ?? '';
    if (accept.includes('text/html')) {
      return req.url;
    }
  },
};

module.exports = {
  '/auth/register': identity,
  '/auth/authorize': identity,
  '/auth/change-password': identity,
  '/auth/me': identity,
  '/auth/update-profile': identity,
  '/profile': identity,
  '/task-categories': tasks,
  '/tasks': tasksApi,
};
