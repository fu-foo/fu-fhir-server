/**
 * @file FHIR Patientリソース Express routes ハンドリング用
 * Includes GET, POST, PUT, DELETE 操作, birthPlaceでの検索を実装
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { readResource, writeResource, deleteResource, searchByName } = require('../utils/fileHandler');
const { validateResource } = require('../utils/validator');
const { validateCardinality } = require('../utils/validateCardinality');
const { searchByParameter } = require('../utils/searchByParameter');
const RESOURCE_DIR = path.join(__dirname, '../data/Patient');

/**
 * GET IDでのPatient取得
 * @route GET /Patient/:id
 */
router.get('/:id', (req, res) => {
  // Patientを保存しているJSONファイルを読む
  const results = JSON.parse(fs.readFileSync("./data/Patient/Patient.json", "utf8"));
  // 指定IDのものを返す
  return res.json(results.filter(r => r.id === req.params.id));
});

/**
 * POST Patient登録
 * @route POST /Patient
 */
router.post("/", (req, res) => {
  // IDはとりあえずUUIDとしておく仕様
  const id = uuidv4();
  // 登録内容のJSON、PatientのResourceType指定、ID(UUID)
  const resource = { ...req.body, resourceType: 'Patient', id };

  // 多重度のバリデーション実行
  const errorsCardinality = validateCardinality(resource, JSON.parse(fs.readFileSync("./defs/StructureDefinition-FU-PATIENT.json", "utf8")));
  // 多重度のバリデーションエラーがあれば標準エラー出力（とりあえず実装。本当は多重度エラーであれば登録しない。）
  if (errorsCardinality.length > 0) {
    console.error('多重度エラー:');
    errorsCardinality.forEach(err => console.error('- ' + err));
    return res.status(400).json({
      resourceType: "OperationOutcome",
        issue: errorsCardinality.map(e => ({
          error : e
        }))
    });
  } else {
    console.log('多重度チェックOK');
  }

  // IGでのバリデーション実行
  const errorsValidation = validateResource(resource);
  if (errorsValidation.length > 0) {
    // 現実の運用ではバリデーションエラーで登録しないけど、とりあえず登録してバリデーションエラーの内容を返す。
    return res.status(400).json({
      resourceType: "OperationOutcome",
      issue: errorsValidation.map(e => ({
        key: e.key,
        severity: e.severity,
        expression: e.expression,
        diagnostics: e.message
      }))
    });
  }

  // バリデーションでエラーがなければ書き込み
  writeResource(RESOURCE_DIR, "Patient", resource);
  res.json(resource);
});

/**
 * PUT (update) IDによるPatient更新
 * @route PUT /Patient/:id
 * @param {string} id - 更新対象のID
 * @bodyParam {Object} resource - 更新内容のJSON
 * @returns {Object} 更新内容
 */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const updatedResource = { ...req.body, resourceType: 'Patient', id };

  // バリデーション
  const errorsCardinality = validateCardinality(updateResource, JSON.parse(fs.readFileSync("./defs/StructureDefinition-FU-PATIENT.json", "utf8")));
  // 多重度のバリデーションエラーがあれば標準エラー出力（とりあえず実装。本当は多重度エラーであれば登録しない。）
  if (errorsCardinality.length > 0) {
    console.error('多重度エラー:');
    errorsCardinality.forEach(err => console.error('- ' + err));
  } else {
    console.log('多重度チェックOK');
  }

  // IGでのバリデーション実行
  const errorsValidation = validateResource(updateResource);
  if (errorsValidation.length > 0) {
    // 現実の運用ではバリデーションエラーで登録しないけど、とりあえず登録してバリデーションエラーの内容を返す。
    if (errorsValidation.length > 0) {
      console.error("バリデーションエラー:");
      errorsValidation.forEach(err => console.error('- ' + err.key + ' ' + err.expression + ' ' + err.message));
    } else {
      console.log('多重度チェックOK');
    }
  }

  // Patient.json書き込み
  const filePath = path.join(RESOURCE_DIR, 'Patient.json');
  let resources = [];

  if (fs.existsSync(filePath)) {
    resources = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // 対象IDを更新、なければnot found
  const index = resources.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '対象なし' });
  }
  resources[index] = updatedResource;

  // 更新
  fs.writeFileSync(filePath, JSON.stringify(resources, null, 2), 'utf8');
  res.json(updatedResource);
});

/**
 * DELETE ID指定でのPATIENT削除
 * @route DELETE /Patient/:id
 */
router.delete('/:id', (req, res) => {
  // 削除
  const success = deleteResource(RESOURCE_DIR, req.params.id);
  if (!success) {
    // 対象なし
    return res.status(404).json({ error: '対象なし' });
  }
  // 削除OK
  res.status(204).send();
});

/**
 * GET birthPlaceでの検索
 * @route GET /Patient
 * @queryParam {string} birthPlace 
 */
router.get('/', (req, res) => {
  // パラメーターからbirthPlace取得
  const nameQuery = req.query.birthPlace;
  if (nameQuery) {
    // 検索
    const ret = searchByParameter(JSON.parse(fs.readFileSync("./data/Patient/Patient.json", "utf8")), 'birthPlace', nameQuery);
    return res.json({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: ret.map(r => ({ resource: r }))
    });
  }
});

module.exports = router;
