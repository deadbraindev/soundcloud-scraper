// console.log("dzialam");
let index = 1;

function addRow() {
    // if(document.getElementsByName(`sourcelink${index}`).innerHTML == "")
    // {
    //     console.log("tak");
    // }
    let li = document.createElement('li');
    // li.setAttribute('id', `${index}`);

        document.getElementById("dynamic-list")
        .appendChild(li)
        // .innerHTML = `<input type="text" class="form-control sourcelink" name="sourcelink${index}">`
        .innerHTML = `<input type="text" class="form-control sourcelink" name="sourcelink">`

    
        index++;

        // let temp = index.toString();
    // console.log(document.getElementById("'" + index + "'").innerHTML)
    // console.log(index.toString());

    

    



    // console.log("dzialam");


}