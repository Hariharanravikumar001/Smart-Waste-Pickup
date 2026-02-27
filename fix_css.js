const fs = require('fs');
const files = [
  'c:/Users/Hari/Desktop/a3/myapp/src/app/register/register.component.css',
  'c:/Users/Hari/Desktop/a3/myapp/src/app/login/login.component.css',
  'c:/Users/Hari/Desktop/a3/myapp/src/app/dashboard/dashboard.component.css',
  'c:/Users/Hari/Desktop/a3/myapp/src/app/app.component.css'
];
for(let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/:global\(\[data-bs-theme="dark"\]\) :host/g, ':host-context([data-bs-theme="dark"])');
  content = content.replace(/:global\(\[data-bs-theme="dark"\]\)/g, ':host-context([data-bs-theme="dark"])');
  fs.writeFileSync(file, content);
}
console.log("Replaced successfully!");
