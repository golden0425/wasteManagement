function check(e:Event){
    const username:HTMLInputElement = document.querySelector('#username') as HTMLInputElement
    const password:HTMLInputElement = document.querySelector('#password') as HTMLInputElement
    if(!username || username.value.length<6 ||username.value.length>12){
        return alert('用户名不合法')
    }
    if(!password || password.value.length<6 ||password.value.length>12){
        return alert('密码不合法')
    }
    e.preventDefault()
}