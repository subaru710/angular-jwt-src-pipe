# angular-jwt-src-pipe
This pipe helps you access image or anything else in html &lt;img> tag directly with jwt auth header under Angular framework.

Sometimes you used jwt token based auth on server to protect images and you also want to access them in html simply like this:
```html
<img [src]="/images/12345678.jpg" class="img-thumbnail"/>
```
But the access will fail because the authentication header is not added to the html request.

# Usage
Dependency: angular2-jwt
```html
<img [src]="/images/12345678.jpg | auth" class="img-thumbnail"/>
```
