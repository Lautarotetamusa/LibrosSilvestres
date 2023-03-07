import fs from 'fs';
import puppeteer from 'puppeteer'

function parse_libros(html, libros){
  var table = '';

  for (let libro of libros) {
    table += 
      `<tr>
        <td>${libro.titulo}</td>
        <td>${libro.autores[0].nombre}</td>
        <td>${libro.isbn}</td>
        <td>${libro.cantidad}</td>
        <td>${libro.precio}</td>
      </tr>`;
  }

  html = html.replace('{{LIBROS}}', table); 
  return html;
}

function parse_cliente(html, cliente){
  html = html.replace('{{cliente.cuit}}', cliente.cuit);

  html = html.replace('{{cliente.razon_social}}', cliente.razon_social);

  html = html.replace('{{cliente.domicilio}}', cliente.domicilio);

  return html;
}

export async function generate_remito(data){

  // Create a browser instance
  //const browser = await puppeteer.launch();

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  });

  // Create a new page
  const page = await browser.newPage();

  //Load the QR data
  var html = fs.readFileSync('./src/emitir_remito/remito.html', 'utf8');
  var css  = fs.readFileSync('./src/emitir_remito/style.css', 'utf8');
  var logo = fs.readFileSync('./src/emitir_remito/Logo.png', 'base64');

  html = html.replace('<style></style>', `<style>${css}</style>`)
  html = html.replace('{{logo}}', `<img src="data:image/jpeg;base64,${logo}">`)

  html = parse_libros(html, data.libros);
  html = parse_cliente(html, data.cliente);
  html = html.replace("{{fecha}}", new Date());

  await page.setContent(html);

  //console.log("data:", data);

  console.log("remito path: ", 'remitos/'+data.path);
  const pdf = await page.pdf({
    path: 'remitos/'+data.path,
    printBackground: true,
    format: 'A4',
  });

  // Close the browser instance
  await browser.close();

  console.log("REMITO generado correctamente");
};