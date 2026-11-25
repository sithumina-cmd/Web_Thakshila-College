import apiApp from '../server/apiRouter.js';

export default function handler(req, res) {
  return apiApp(req, res);
}
