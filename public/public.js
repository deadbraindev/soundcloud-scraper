let index = 1;
function addRow() {
    let li = document.createElement('li');
    document.getElementById("dynamic-list")
    .appendChild(li)
    .innerHTML = `<input type="text" class="form-control sourcelink" name="sourcelink">`
    index++;
}