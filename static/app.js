// src-web/app.ts
var q = (query) => document.querySelector(query);
var on = (e) => e.classList.add("on");
var off = (e) => e.classList.remove("on");
var fileInput = q("#file");
fileInput.addEventListener("input", function(ev) {
  if (this.files && this.files.length >= 1) {
    const blob = this.files[0];
    const url = URL.createObjectURL(blob);
    const placeholder = q('label[for="file"] > img.placeholder');
    const preview = q('label[for="file"] > img.preview');
    off(placeholder);
    preview.src = url;
    on(preview);
  }
});
var legofy = q("div.interaction > div.legofy");
legofy.addEventListener("click", async () => {
  if (fileInput.files && fileInput.files.length >= 1) {
    const loader = q("div.interaction div.legofy > div");
    const button = q("div.interaction div.legofy > span");
    off(button);
    on(loader);
    fileInput.disabled = true;
    const file = fileInput.files[0];
    const brickInput = q("div.interaction > input");
    const brickSize = parseInt(brickInput.value) || 50;
    const response = await fetch(`http://127.0.0.1:8000/legofy/${brickSize}`, {
      method: "POST",
      body: file
    });
    off(loader);
    on(button);
    if (response.status !== 200) {
      const placeholder = q('label[for="file"] > img.placeholder');
      const preview = q('label[for="file"] > img.preview');
      placeholder.classList.add("on");
      on(placeholder);
      off(preview);
      return;
    }
    const blob = await response.blob();
    const left = q("section.output > div.left img");
    const right = q("section.output > div.right img");
    const download = q("section.output > div.right a");
    left.src = URL.createObjectURL(file);
    right.src = URL.createObjectURL(blob);
    download.download = `${file.name.split(".").at(0)}.lego.png`;
    download.src = right.src;
    fileInput.disabled = false;
    const input = q("section.input");
    const output = q("section.output");
    off(input);
    on(output);
  }
});
