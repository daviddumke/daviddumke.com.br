/* BOM DIA
 * Este código foi desenvolvido por David Renato Dumke.
 * As operações são simples, baseadas nas condições gerais do teste.
 * Algumas mudanças foram feitas, porém documentadas.
 * Não foi utilizado nenhum conceito de POO ou nada similar, por motivo de tempo.
 */


/* INÍCIO DAS FUNÇÕES DE PARCELAMENTO
 * Os dados de parcelamento estão disponíveis no JSONP, porém identifiquei uma
 * necessidade comum dos clientes (o valor mínimo de parcela).
 * Para entregar um parcelamento adequado a esta realidade montei as funções abaixo,
 * que servem basicamente para encontrar um número de parcelas e um valor correto de cada parcela.
 */


/* Subscrevendo math.ceil para arredondar casas decimais para cima
 * Esta mudança foi feita visando entregar sempre um valor de parcela arredondado para cima,
 * isto é importante para evitar que um preço, após parcelado acabe ficando menor.
 */
Math.ceil = (function() {
	var originalCeil = Math.ceil;
	return function(number, precision) {
		precision = Math.abs(parseInt(precision)) || 0;
		var multiplier = Math.pow(10, precision);
		return (originalCeil(number * multiplier) / multiplier);
	};
})();


/* Função que retorna o parcelamento (número de parcelas) baseado no preço, e 
 * levando em consideração um valor mínimo de parcela.
 */
function getInstallment(price)
{
	var priceInFloat = price.replace("R$ ", "").replace(",", ".");
	// Valor minimo da parcela
	valorMinimo = 49.99;
	return Math.floor(priceInFloat / valorMinimo);
}

/* Função que retorna o valor do parcelamento baseado no preço e 
 * no número de parcelas
 */
function getInstallmentValue(installment, price)
{
	var priceInFloat = price.replace("R$ ", "").replace(",", ".");
	return Math.ceil(priceInFloat/installment, 2).toFixed(2).toString().replace(".", ",");
}

/* FIM DAS FUNÇÕES DE PARCELAMENTO
 * Após usar estas funções será entregue às vitrines preços parcelados, 
 * sendo que NUNCA será mostrado uma parcela menor que R$ 49,99
 */


/* INÍCIO DA FUNÇÃO DE CALLBACK DA CHAORDIC
 * Motivado pelo uso do JSONP abaixo temos a função que trata o retorno do JSON
 */
function X(data)
{

	/* Informação IMPORTANTE
	 * Resolvi utilizar Template Strings para montar os htmls das vitrines.
	 * A ideia aqui é: 
	 *     1. Manter os códigos visualmente claros;
	 *     2. Reutilizar código;
	 *     3. Facilitar mudanças no html, com fins de manutenção;
	 * Os nomes das constantes e variáveis são auto-explicativos.
	 *
	 * Obs.: Por motivo de tempo e falta de necessidade não fiz uma abstração maior das funções, mas
	 * entendo que na utilização de mais vitrines uma programação mais escalável se faz necessária.
	 * Por hora, criei tudo dentro desta mesma função.
	 */

	const vitrineTitle = 'Vitrine de recomendação por produto';
	const productReferenceTitle = 'Você visitou';
	const productRecommendationTitle = 'e talvez se interesse por:';
	const productReference =  data.data.reference.item;
	const productRecommendation =  data.data.recommendation;


	// Html padrão do Produto Referência:
	const htmlProductReference = `
	<div class="col-lg-12">
		<a href="${productReference.detailUrl}">
			<img class="img-responsive" src="${productReference.imageName}" />
			<p class="product-name"> ${productReference.name.slice(0, 85)} ...</p>
			<p class="old-price"> De: <span class="old-price-value">${productReference.oldPrice}</span></p>
			<p class="price"> Por: <span class="price-value">${productReference.price}</span></p>
			<p class="installment"> ou <span class="installment-parcel">${getInstallment(productReference.price)}</span>x de R$ <span class="installment-value">${getInstallmentValue(getInstallment(productReference.price), productReference.price)}</span></p>
			<p class="no-interest"> sem juros</p>
		</a>
	</div>
	`;


	// Html padrão dos Produtos Recomendados:
	const htmlProductRecommendation = `
	${productRecommendation.map(product => `
	<div class="col-lg-4">
		<a href="${product.detailUrl}">		
			<img class="img-responsive" src="${product.imageName}" />
			<p class="product-name">${product.name.slice(0, 85)} ...</p>
			<p class="old-price"> De: <span class="old-price-value">${product.oldPrice}</span></p>
			<p class="price"> Por: <span class="price-value">${product.price}</span></p>
			<p class="installment"> ou <span class="installment-parcel">${getInstallment(product.price)}</span>x de R$ <span class="installment-value">${getInstallmentValue(getInstallment(product.price), product.price)}</span></p>
			<p class="no-interest"> sem juros</p>
		</a>
	</div>`).join('')} `;


	// Html padrão da Vitrine de Recomendação:
	const htmlVitrine = `
	<div class="row">
		<div class="col-lg-12">
			<h1 class="text-center">${vitrineTitle}</h1>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-3 col-md-3 col-sm-4">
			<div class="row">
				<div class="col-lg-12">
					<h3>${productReferenceTitle}</h3>
				</div>
			</div>
			<div class="row">
				<div class="col-lg-12">
					
					${htmlProductReference}
					</a>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-9 col-sm-8">
			<div class="row">
				<div class="col-lg-12">
					<h3>${productRecommendationTitle}</h3>
				</div>
			</div>
			<div class="row">
					${htmlProductRecommendation}
			</div>
		</div>
	</div>
	`;

	// Insere os valores retornados dentro da div especificada
	document.getElementById("vitrine").innerHTML = htmlVitrine;

}

// Código responsável pela leitura do JSONP
var script = document.createElement('script');
script.src = 'http://roberval.chaordicsystems.com/challenge/challenge.json?callback=X'

document.getElementsByTagName('head')[0].appendChild(script);