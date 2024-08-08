let width = 0
window.onload = ()=>{
    width = window.innerWidth
    document.querySelector("#root").style.height = window.innerHeight + "px"
    const ul = document.querySelector("#tasklist ul")

    toggleTheme(getTheme()==="light"?"dark":"light")
    initBgImage()

    const count = document.querySelector("#count")
    let i = compteur();
    count.innerText = i;
    const data = fetchStorage("task");
    if (data.length){
        for (i of data){
            const li = new TodoListItem(i)
            ul.append(li.elem)
        }
    }
    else{
        ul.innerHTML = "<li style='border-bottom: none' id='no-data'>No data</li>"
    }
}
window.onresize = ()=>{
    document.querySelector("#root").style.height = window.innerHeight + "px"
    document.querySelector("#root").style.width = window.innerWidth + "px"
    initBgImage()
}
function initBgImage(){
    document.querySelector("#bg").src = `./images/bg-${CheckWidth()}-${getTheme()}.jpg`
}
function getTheme(){
    if(!localStorage.getItem("theme")){
        localStorage.setItem("theme", "light");
        return "light";
    }
    return localStorage.getItem("theme");
}
function toggleTheme(theme){
    let div = document.querySelectorAll(`div[class^=${theme}], body`)
    const newTheme = theme==="light"?"dark":"light"
    localStorage.setItem("theme", newTheme)

    changeIconTheme(theme);

    div.forEach(e=>{
        e.className = e.className.replace(new RegExp(theme, "gi"), newTheme);
    })
}
function changeIconTheme(theme){
    const e = document.querySelector("header img")
    if (theme==="light"){
        e.src = e.src.replace("moon", "sun")
    }
    else{
        e.src = e.src.replace("sun", "moon")
    }
}
function CheckWidth(){
    if (window.innerWidth < 540){
        return "mobile"
    }
    return "desktop"
}
function changeBgImage(theme){
    const bg = document.querySelector("#bg")
    if (theme==="light"){
        bg.src = `./images/bg-${CheckWidth()}-dark.jpg`
    }
    else{
        bg.src = `./images/bg-${CheckWidth()}-light.jpg`
    }
}
function checked(elem){
    elem.parentElement.classList.add("checked")
    elem.parentElement.nextElementSibling.classList.add("checked-text")
}
const btncheck = document.querySelectorAll(".first")
btncheck.forEach(el => {
    el.addEventListener("click", e=>checked(e.target))
})
const toggleThemeBtn = document.querySelector("header button");
toggleThemeBtn.addEventListener("click", ()=>{
    const theme = getTheme()
    toggleTheme(theme)
    changeBgImage(theme)
})

function fetchStorage(name){
    let data = localStorage.getItem(name)?localStorage.getItem(name):"[]";
    return JSON.parse(data);
}
function addData(donnee){
    let data = fetchStorage("task")
    data = [donnee, ...data]
    localStorage.setItem("task", JSON.stringify(data))
}
function delData(donnee){
    let data = fetchStorage("task")
    data = data.map((i)=>{
        if (i.id === donnee.id){
            return ""
        }
        return i
    })
    data.splice(data.indexOf(""), 1)
    localStorage.setItem("task", JSON.stringify(data))
}
function majData(donnee){
    let data = fetchStorage("task")
    data = data.map((i)=>{
        if (i.id === donnee.id){
            i.completed = donnee.completed
            return i
        }
        return i
    })
    localStorage.setItem("task", JSON.stringify(data))
}

const inputNewTask = document.querySelector("#form input");
const imgInput = document.querySelector("#form img");
imgInput.addEventListener("click", (e)=>{
    if (e.target.previousElementSibling.value){
        NewTask(e.target.previousElementSibling)
    }
})
inputNewTask.addEventListener("keydown", (e)=>{
    if (e.keyCode === 13 && e.target.value){
        NewTask(e.target)
    }
})
function NewTask(elem){
    const ul = document.querySelector("#tasklist ul")
    if (ul.querySelector("#no-data")){
        ul.querySelector("#no-data").remove()
    }
    const data = {
        id: Date.now(),
        taskname: elem.value,
        completed: false
    }
    addData(data)
    const li = new TodoListItem(data)
        const count = document.querySelector("#count")
        count.innerText = compteur()
        ul.prepend(li.elem)
        elem.value = "";
}
function compteur(){
    const data = fetchStorage("task")
    let i = 0
    for (e of data){
        if (!e.completed){
            i++
        }
    }
    return i
}
class TodoListItem{
    #todo
    #li
    /**
     * 
     * @param {Object} todo 
     */
    constructor(todo){
        this.#todo = todo
        this.#duplicate()
        this.#li.setAttribute("draggable", true)
        this.#li.addEventListener("dragstart", (event)=>{
            event.dataTransfer.effectAllowed = "move"
            event.target.style.cursor = "dragging"
            draggedElement = event.target
        })
        const p = this.#li.querySelector("p")
        p.innerHTML = todo.taskname
        const del = this.#li.lastElementChild
        del.addEventListener("click", ()=>{
            this.#remove()
            this.#decompte("del")
            this.#checknodata()
        })
        const check = this.#li.firstElementChild
        if (this.#todo.completed){
            this.#toggleCompleted(check)
        }
        check.addEventListener("click", ()=>{
            this.#todo.completed = !(todo.completed)
            this.#toggleCompleted(check)
            majData(this.#todo)
            this.#decompte("check");
        })
    }
    #duplicate(){
        const li = document.querySelector("#todolistitem")
        this.#li = li.content.cloneNode(true).children[0]
    }
    #toggleCompleted(elem){
        elem.classList.toggle("checked-btn")
        elem.parentElement.classList.toggle("is-completed")
        elem.nextElementSibling.classList.toggle("checked-text")
        elem.querySelector("img").classList.toggle("checked-img")
        elem.querySelector("img").classList.toggle("unchecked-img")
    }
    #remove(){
        this.#li.remove()
        delData(this.#todo)
    }
    #checknodata(){
        const ul = document.querySelector("#tasklist ul")
        if (!ul.children.length){
            ul.innerHTML = "<li style='border-bottom: none' id='no-data'>No data</li>";
        }
    }
    #decompte(type){
        const count = document.querySelector("#count")
        if (type === "check"){
            if (this.#todo.completed){
                count.innerText = (parseInt(count.innerText)-1).toString()
            }
            else{
                count.innerText = (parseInt(count.innerText)+1).toString()
            }
        }
        else{
            count.innerText = (parseInt(count.innerText)-1).toString()
        }
    }
    get elem(){
        return this.#li;
    }
}
const clearer = document.querySelector("#clear")
clearer.addEventListener("click", ()=>{
    const completed = document.querySelectorAll(".is-completed")
    const ul = document.querySelector("#tasklist ul")
    if (completed){
        completed.forEach(e=>{
            e.remove()
        })
        if (!ul.children.length){
            ul.innerHTML = "<li style='border-bottom: none' id='no-data'>No data</li>"
        }
    }
    let data = fetchStorage("task")
    data = data.filter(e => !e.completed)
    localStorage.setItem("task", JSON.stringify(data))
})

function toggleTodo(elem){
    const type = elem.innerText
    elem.parentElement.querySelector(".active").classList.remove("active")
    elem.classList.add("active")
    const ul = document.querySelector("#tasklist ul")
    if(type === "Active"){
        ul.classList.add("afaire")
        ul.classList.remove("faite")
    }
    else if(type === "Completed"){
        ul.classList.remove("afaire")
        ul.classList.add("faite")
    }
    else{
        ul.classList.remove("afaire")
        ul.classList.remove("faite")
    }
}
const btngroup = document.querySelectorAll(".group-btn")
btngroup.forEach(e=>{
    e.querySelectorAll("button").forEach(el=>{
        el.addEventListener("click", (i)=>{toggleTodo(i.target)})
    })
})

let draggedElement = null;
const ul = document.querySelector("#tasklist ul")
ul.addEventListener("dragover", (e)=>{
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
})  
ul.addEventListener("drop", (e)=>{
    e.preventDefault()
    if (draggedElement.nodeName === "LI" && e.target !== draggedElement && e.target.nodeName === "LI"){
        let nodes = Array.from(ul.children)
        let di = nodes.indexOf(draggedElement)
        let dt = nodes.indexOf(e.target)
        if (di < dt){
            ul.insertBefore(draggedElement, e.target.nextElementSibling)
        }
        else{
            ul.insertBefore(draggedElement, e.target)
        }
    }
})


