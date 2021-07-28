module.exports = {
  commonTemplate: compoentName => {
    return `<template>
    <div class="${compoentName}">
    </div>
</template>
<script>
    export default {
        name: '${compoentName}'
    };
</script>
<style lang="less" scoped>
  @import "./index";
</style>`
  },
  entryTemplate: compoentName => `import ${compoentName} from './${compoentName}.vue'
export default ${compoentName}`
}
