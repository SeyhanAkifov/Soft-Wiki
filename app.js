const router = Sammy('#root', function () {

    this.use('Handlebars', 'hbs');

    this.get('/home', async function (context) {
        

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.email = email;
        }

        await fetch('https://soft-wiki-4a1d6.firebaseio.com/.json')
            .then(response => response.json())
            .then(data => {
                if (data) {

                    Object.keys(data).map(key => (data[key].creator == context.email ? data[key].isAuthor = true : ""))
                    //context.hasNoTeam = false
                    context.articles = Object.keys(data).map(key => ({ key, ...data[key] }));
                    context.articlesJavaScript = context.articles.filter(x => x.category == "JavaScript");
                    context.articlesJavaScript.sort((a,b) => a.title.localeCompare(b.title))
                    context.articlesJava = context.articles.filter(x => x.category == "Java");
                    context.articlesJava.sort((a,b) => a.title.localeCompare(b.title))
                    context.articlesPython = context.articles.filter(x => x.category == "Python")
                    context.articlesPython.sort((a,b) => a.title.localeCompare(b.title))
                    context.articlesCSharp = context.articles.filter(x => x.category == "CSharp")
                    context.articlesCSharp.sort((a,b) => a.title.localeCompare(b.title))

                }
            })

        await this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'noArticleMessage' : './templates/noArticleMessage.hbs',
            'article' : './templates/article.hbs'

            //'post': './templates/posts/post.hbs',

        }).then(function () {
            this.partial('../templates/home.hbs')
        });

    });

    this.get('/login', function (context) {
        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'loginForm': './templates/login/loginForm.hbs',
        }).then(function () {
            this.partial('../templates/login/loginPage.hbs')
        })


    });

    this.post('/login', function (context) {


        const { email, password } = context.params
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userInfo) => {
                localStorage.setItem('userInfo', JSON.stringify({ uid: userInfo.user.uid, email: userInfo.user.email }));
                context.redirect('/home')
                //showMessage(infoBox, "Sucsessfuly logged");
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                //showMessage(errorBox, error.message);
            });
    });


    this.get('/register', function () {

        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'registerForm': './templates/register/registerForm.hbs',
        }).then(function () {
            this.partial('../templates/register/registerPage.hbs')
        })
    });

    this.post('/register', function (context) {
        const { email, password, reppass } = context.params;

        if (password !== reppass) {

            //showMessage(errorBox, "Passwords doesnt match");
            return;
        }
        console.log(context)

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((createdUser) => {
                context.redirect('/login')
                //showMessage(infoBox, "Sucsessfuly registered");
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                //showMessage(errorBox, errorMessage);
                // ...
            });
    });

    this.get('/logout', function (context) {
        console.log(context)
        firebase.auth().signOut()
            .then(function () {
                localStorage.removeItem('userInfo');
                context.loggedIn = false
                context.redirect('/home');
                //showMessage(infoBox, "You are logged out");
            }).catch(function (error) {
                //showMessage(errorBox, error.message);
            })

    });

    this.get('/create', function () {

        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'createForm': './templates/create/createForm.hbs',
        }).then(function () {
            this.partial('../templates/create/createPage.hbs')
        })
    });

    this.post('/create-article', function (context) {

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.email = email;
        }
        const { title, category, content, email } = context.params;


        if (!title || !category || !content) {
            return
        }
        fetch('https://soft-wiki-4a1d6.firebaseio.com/.json',
            {
                method: "POST",
                body: JSON.stringify({
                    title,
                    category,
                    content,
                    creator: context.email

                })
            })

        context.redirect('/home')


    });

    this.get('/details/:id', async function (context) {

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.email = email;
        };

        await fetch(`https://soft-wiki-4a1d6.firebaseio.com/${context.params.id}.json`)
            .then(response => response.json())
            .then(data => {
                context.title = data.title;
                context.category = data.category;
                context.content = data.content;
                context.isAuthor = data.creator == context.email ?true : undefined 


            });


        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        }).then(function () {
            this.partial('../templates/details/details.hbs')
        });

        context.key = context.params.id
    });

    this.get('/delete/:id', async function (context) {

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.email = email;
        };
        await fetch(`https://soft-wiki-4a1d6.firebaseio.com/${context.params.id}.json`, {
            method: "DELETE"
        });

        context.redirect('/home');


    });

    this.get('/edit/:id', async function (context) {

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.email = email;
        };
        await fetch(`https://soft-wiki-4a1d6.firebaseio.com/${context.params.id}.json`)
            .then(response => response.json())
            .then(data => {
                context.title = data.title;
                context.category = data.category;
                context.content = data.content;
                


            });

        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs',
            'editForm': './templates/edit/editForm.hbs',
            
        }).then(function () {
            this.partial('../templates/edit/editPage.hbs')
        });

        context.key = context.params.id

    });

    this.post('/edit/:id', function (context) {

        if (localStorage.userInfo) {
            const { uid, email } = JSON.parse(localStorage.userInfo)
            context.loggedIn = true;
            context.params.email = email;
        };

        const { title, category, content, email } = context.params;
        let obj = {
            title,
            category,
            content,
            creator: email,
        };

        fetch(`https://soft-wiki-4a1d6.firebaseio.com/${context.params.id}.json`,
            {
                method: "PUT",
                body: JSON.stringify(obj)
            }).then(async () => await context.redirect('/home'));


        });




});

(() => {
 router.run('/home');
})()