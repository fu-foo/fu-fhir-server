/**
 * @file FHIR Patient JSONファイルの具体的なCRUD操作
 */
const fs = require('fs');
const path = require('path');

/**
 * 全部のPatientリソースJSONを読む
 * @param {string} [storageDir='./data/Patient'] - Patient JSON保管場所
 * @returns {Array<Object>} Patientリソース内容
 */
function readResource(storageDir = './data/Patient') {
  const filePath = path.join(storageDir, 'PATIENT.json');
  if (!fs.existsSync(filePath)) return [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const resources = JSON.parse(content);
    return Array.isArray(resources) ? resources : [];
  } catch (e) {
    console.error('PATIENT.json読み込み・パース失敗:', e);
    return [];
  }
}

/**
 * 新規Patient書き込み
 * @param {string} storageDir - Patient書き込みディレクトリ
 * @param {string} resourceType - リソース名
 * @param {Object} resource - 追加リソース
 */
function writeResource(storageDir = './data/Patient', resourceType, resource) {
  // なければディレクトリ作成
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  const filePath = path.join(storageDir, `${resourceType}.json`);
  let resources = [];

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      resources = Array.isArray(parsed) ? parsed : [];
    } catch {
      console.warn('ファイル内容が壊れてる？（JSONではない？）');
    }
  }

  // 書き込み
  resources.push(resource);
  fs.writeFileSync(filePath, JSON.stringify(resources, null, 2), 'utf8');
}

/**
 * Patient削除
 * @param {string} dir - Patient.jsonのあるディレクトリ
 * @param {string} id - 削除対象ID
 * @returns {boolean} 削除対象リソース
 */
function deleteResource(dir = './data/Patient', id) {
  const filePath = path.join(dir, 'PATIENT.json');
  if (!fs.existsSync(filePath)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data)) return false;

    const newData = data.filter(resource => resource.id !== id);
    const deleted = newData.length !== data.length;

    if (deleted) {
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
    }

    return deleted;
  } catch (e) {
    console.error('削除失敗:', e);
    return false;
  }
}

module.exports = {
  readResource,
  writeResource,
  deleteResource
};
