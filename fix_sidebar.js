const fs = require('fs');
let f = 'c:/Users/Hari/Desktop/a3/myapp/src/app/sidebar/sidebar.component.css';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/\[data-bs-theme="dark"\]/g, ':host-context([data-bs-theme="dark"])');
fs.writeFileSync(f, c);
console.log('Fixed Sidebar CSS');
