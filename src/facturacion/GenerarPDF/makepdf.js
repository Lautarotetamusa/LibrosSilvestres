//const fs = require('fs')
import fs from 'fs';

//const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer'
import { Venta } from '../../models/venta.model.js';

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
  html = html.replace('{{cliente_cond}}', cliente.cond_fiscal);

  html = html.replace('{{cliente_cuit}}', cliente.cuit);

  html = html.replace('{{cliente_tipo_venta}}', cliente.tipo_venta);

  html = html.replace('{{cliente_nombre}}', cliente.razon_social);

  html = html.replace('{{cliente_domicilio}}', cliente.domicilio);

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

  return html;
}

export async function html2pdf(qr_data, venta){

  // Create a browser instance
  //const browser = await puppeteer.launch();

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
  });

  // Create a new page
  const page = await browser.newPage();

  //Load the QR venta
  var html = fs.readFileSync('./src/facturacion/GenerarPDF/Factura.html', 'utf8');
  var css  = fs.readFileSync('./src/facturacion/GenerarPDF/viewer.css', 'utf8');
  var logo = fs.readFileSync('./src/facturacion/GenerarPDF/Logo.png', 'base64');
  console.log("logo:", logo);


  html = html.replace('<style></style>', `<style>${css}</style>`)
  html = html.replace('<img class="qr" src="">', `<img class="qr" src="${qr_data}">`)
  html = html.replace('<img class="logo">', `<img class="logo" src="venta:image/jpeg;base64,${logo}">`)
  
  html = parse_libros(html, venta.libros);
  html = parse_cliente(html, venta.cliente);
  html = parse_comprobante(html, venta.comprobante)

  html = html.replace('{{cond_venta}}', venta.tipo);
  html = html.replaceAll('{{TOTAL}}', venta.total);

  await page.setContent(html);

  console.log('facturas/'+venta.path);
  const pdf = await page.pdf({
    path: 'facturas/'+venta.path,
    printBackground: true,
    format: 'A4',
  });

  // Close the browser instance
  await browser.close();

  console.log("FACTURA generado correctamente");
};