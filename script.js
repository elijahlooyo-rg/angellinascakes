const navLinks = document.getElementById("nav-list")
const menu = document.getElementById("humbger")

menu.addEventListener("click",mobileMenu)
function mobileMenu(){
    navLinks.classList.toggle("active")
}