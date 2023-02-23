//const fs = require('fs')
import fs from 'fs';

//const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer'


/*
    IMPORTANTE!!!
    con puppeter no se si hace falta
    poner esto para que ande PhantomJS
    export OPENSSL_CONF=/dev/null
*/

function parse_libros(html, libros){
  var table = '';

  for (let i in libros) {
    let bonif = libros[i].bonif * 0.01;
    let imp_bonif = libros[i].precio * libros[i].cantidad * bonif;
    let subtotal  = libros[i].precio * libros[i].cantidad * (1 - bonif);

    table += 
      `<tr>
        <td style="text-align:left">${libros[i].isbn}</td>
        <td style="text-align:left">${libros[i].titulo}</td>
        <td>${libros[i].cantidad}</td>
        <td>${libros[i].precio}</td>
        <td>${libros[i].bonif}</td>
        <td>${imp_bonif}</td>
        <td>${subtotal}</td>
      </tr>`;
  }

  html = html.replace('{{LIBROS}}', table); 
  return html;
}

function parse_cliente(html, cliente){

  if (!cliente.datosGenerales.domicilioFiscal.localidad)
    cliente.datosGenerales.domicilioFiscal.localidad = 'CAPITAL FEDERAL'


  let impuestos = null;
  if (cliente.datosRegimenGeneral)
     impuestos = cliente.datosRegimenGeneral.impuesto
  else if(cliente.datosMonotributo)
    impuestos = cliente.datosMonotributo.impuesto

  var iva = impuestos.find(i => i.idImpuesto == 32);
  if (iva)
    html = html.replace('{{cliente_cond}}', iva.descripcionImpuesto);

  
  html = html.replace('{{cliente_cuit}}', cliente.datosGenerales.idPersona);
  html = html.replace('{{cliente_tipo_venta}}', cliente.tipo_venta);

  if (cliente.datosGenerales.tipoPersona == 'JURIDICA')
    html = html.replace('{{cliente_nombre}}', cliente.datosGenerales.razonSocial);
  else 
    html = html.replace('{{cliente_nombre}}', cliente.datosGenerales.nombre+' '+cliente.datosGenerales.apellido);

  html = html.replace('{{cliente_domicilio}}', `
    ${cliente.datosGenerales.domicilioFiscal.direccion} - 
    ${cliente.datosGenerales.domicilioFiscal.localidad}, 
    ${cliente.datosGenerales.domicilioFiscal.descripcionProvincia}
  `);

  return html;
}

function parse_comprobante(html, comprobante){
  html = html.replace('{{tipo_factura}}', 'C');
  html = html.replace('{{cod_factura}}', comprobante.CbteTipo);
  html = html.replace('{{punto_venta}}', String(comprobante.PtoVta).padStart(5, '0'));
  html = html.replace('{{cae}}', comprobante.CodAutorizacion);
  html = html.replace('{{fecha_vto}}', comprobante.FchVto);
  html = html.replace('{{fecha_emision}}', comprobante.CbteFch);
  html = html.replace('{{nro_comprobante}}', String(comprobante.nro).padStart(8, '0'));
  html = html.replace('{{cond_venta}}', comprobante.tipoVenta);
  html = html.replaceAll('{{TOTAL}}', comprobante.total);
  
  return html;
}

export async function html2pdf(qr_data, data){

  // Create a browser instance
  //const browser = await puppeteer.launch();

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  });

  // Create a new page
  const page = await browser.newPage();

  //Load the QR data
  var html = fs.readFileSync('./src/facturacion/GenerarPDF/Factura.html', 'utf8');
  var css  = fs.readFileSync('./src/facturacion/GenerarPDF/viewer.css', 'utf8');
  var logo = fs.readFileSync('./src/facturacion/GenerarPDF/Logo.png', 'base64');

 
  html = html.replace('<style></style>', `<style>${css}</style>`)
  html = html.replace('<img class="qr" src="">', `<img class="qr" src="${qr_data}">`)
  html = html.replace('<img class="logo">', `<img class="logo" src="data:image/jpeg;base64,${logo}">`)

  html = parse_libros(html, data.libros);

  html = parse_cliente(html, data.cliente);

  html = parse_comprobante(html, data.comprobante)


  await page.setContent(html);

// Downlaod the PDF
  let date = new Date().toISOString()
    .replace(/\..+/, '')     // delete the . and everything after;
    .replace(/T/, '_')      // replace T with a space
    .replaceAll('-', '_')
    .replaceAll(':', '');

  //console.log("data:", data);

  const pdf = await page.pdf({
    path: 'facturas/'+date+'_'+data.comprobante['DocNro']+'.pdf',
    printBackground: true,
    format: 'A4',
  });

  // Close the browser instance
  await browser.close();

  console.log("PDF generado correctamente");
};