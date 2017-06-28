# angular-jwt-src-pipe
This pipe helps you access image or anything else in html &lt;img> tag directly with jwt auth header.

Sometimes you used jwt token based auth on server to protect images and you also want to access them in html simply like this:
```html
<img [src]="/images/12345678.jpg" class="img-thumbnail"/>
```

# Usage
Dependency: angular2-jwt
```html
<img [src]="/images/12345678.jpg | auth" class="img-thumbnail"/>
```
