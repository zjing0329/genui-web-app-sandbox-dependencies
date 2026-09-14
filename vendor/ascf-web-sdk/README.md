### @atomicservice/ascf-web-sdk
#### `es6` 需要在 webview 内嵌的网页中引入` @atomicservice/ascf-web-sdk`
```bash
import has from '@atomicservice/ascf-web-sdk';
 has.ascfweb.getEnv(function(res) {
  console.log('getEnv: ' + JSON.stringify(res));
});
```

#### `umd` 需要在 webview 内嵌的网页中引入` @atomicservice/ascf-web-sdk`
```bash
<script src="../dist/ascf-web-sdk.umd.js"></script>
<script>
 has.ascfweb.getEnv(function(res) {
  console.log('getEnv : ' + JSON.stringify(res));
});
</script>
```
