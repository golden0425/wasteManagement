// template.js
module.exports = {
  globalRegisterImportTemplate: compoentName =>
    `import ${compoentName} from './${compoentName}/${compoentName}'`,
  globalRegisterExportTemplate: compoentName =>
    `Vue.component(${compoentName}.name, ${compoentName})\n}`
}
