const express = require('express');
const app = express();
const patientRouter = require('./routes/patient');
const PORT = 3000;

// CORS用。あくまでも手元で確認するため用なので実運用では使わないこと。
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 全てのドメインからのアクセスを許可
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());
app.use('/Patient', patientRouter);

app.listen(PORT, () => {
  console.log(`FHIR server listening on http://localhost:${PORT}`);
});
