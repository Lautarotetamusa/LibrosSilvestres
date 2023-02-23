//const Afip = require('@afipsdk/afip.js');
import Afip from '@afipsdk/afip.js';

//const QRcode = require('qrcode');
import QRcode from 'qrcode';

//const fs = require('fs');
import fs from 'fs';

//const html2pdf = require('./GenerarPDF/makepdf.js');
import { html2pdf } from './GenerarPDF/makepdf.js'

const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

// cuenta madre
const afip_madre = new Afip({
	CUIT: 27249804024,
	ta_folder: './src/facturacion/ClavesLibrosSilvestres/Tokens/',
	res_folder: './src/facturacion/ClavesLibrosSilvestres/',
	key: 'private_key.key',
	cert: 'FacturadorLibrosSilvestres_773cb8c416f11552.crt',
	production: true,
});
const afip = new Afip({
	CUIT: 20434919798,
	ta_folder: './src/facturacion/Claves/Tokens/',
	res_folder: './src/facturacion/Claves',
	key: 'private_key.key',
	cert: 'cert.pem',
	production: false,
});


function qr_url(voucher){
	const url = 'https://www.afip.gob.ar/fe/qr/?p=';

	let datos_comprobante = {
		ver: 1,
		fecha: 	afip.ElectronicBilling.formatDate(voucher.CbteFch),
		cuit: 	voucher.emisor,
		ptoVta: voucher.PtoVta,
		tipoCmp: voucher.CbteTipo,
		nroCmp: voucher.nro,
		importe: parseFloat(voucher.ImpTotal),
		moneda: voucher.MonId,
		tipoDocRec: voucher.DocTipo,
		nroDocRec: parseInt(voucher.DocNro),
		tipoCodAut: "E", //“E” para comprobante autorizado por CAE
		codAut: parseInt(voucher.CodAutorizacion)
	}
	console.log(datos_comprobante);

	var buff = Buffer.from(JSON.stringify(datos_comprobante)).toString("base64");
	console.log(url+buff);

	return url+buff;
}
 
function calc_subtotal(libro){
    return libro.precio * libro.cantidad * (1 - libro.bonif * 0.01);
}

export async function create_factura(libros, venta){

	const cliente = await afip_madre.RegisterScopeFive.getTaxpayerDetails(venta.cliente);
		
	if (cliente === null){
		console.log('La persona con CUIT', venta.cliente, ' no existe');
		return {error: `La persona con CUIT ${venta.cliente} no existe`, success:false};
	}

	let total = libros.reduce((sum, libro) => sum + calc_subtotal(libro), 0);
	let data = {
		'CantReg' 	: 1,  // Cantidad de comprobantes a registrar
		'PtoVta' 	: venta.punto_venta,  // Punto de venta
		'CbteTipo' 	: venta.tipo_cbte,  // Tipo de comprobante (ver tipos disponibles) 
		'Concepto' 	: 1,  // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
		'DocTipo' 	: 80, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
		'DocNro' 	: venta.cliente,  // Número de documento del comprador (0 consumidor final)
		'CbteFch' 	: parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
		'ImpTotal' 	: total, // Importe total del comprobante
		'ImpTotConc': 0,   		// Importe neto no gravado
		'ImpNeto' 	: total, // Importe neto gravado
		'ImpOpEx' 	: 0,   // Importe exento de IVA
		'ImpIVA' 	: 0,  //Importe total de IVA
		'ImpTrib' 	: 0,   //Importe total de tributos
		'MonId' 	: 'PES', //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
		'MonCotiz' 	: 1,     // Cotización de la moneda usada (1 para pesos argentinos)
	};
	//console.log("data:", data);


	let {voucherNumber} = await afip.ElectronicBilling.createNextVoucher(data);
	//console.log(voucherNumber);

	let voucherInfo = await afip.ElectronicBilling.getVoucherInfo(voucherNumber, venta.punto_venta, venta.tipo_cbte);
	
	voucherInfo.nro 	= voucherNumber;
	voucherInfo.CbteFch = afip.ElectronicBilling.formatDate(voucherInfo.CbteFch);
	voucherInfo.FchVto	= afip.ElectronicBilling.formatDate(voucherInfo.FchVto);
	voucherInfo.emisor 	= venta.cuit;
	voucherInfo.tipoVenta = venta.tipo;
	voucherInfo.total 	= total;
	//console.log(voucherInfo);
	
	
	QRcode.toDataURL(qr_url(voucherInfo), function (err, base64_qr) {
		html2pdf(base64_qr, {
			libros: libros,
			comprobante: voucherInfo,
			cliente: cliente,
		});
	});
}

//const data = JSON.parse(fs.readFileSync('pruebaFactura.json'));
//create_factura(data.libros, data.venta);