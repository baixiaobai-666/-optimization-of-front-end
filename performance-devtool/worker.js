addEventListener('message', function(res) {
  let total = 0;
  let num = res.data;
  for (let i = 0; i < num; i++) {
    total += i;
  }
  postMessage(total);
})
