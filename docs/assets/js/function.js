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


 function createControlsSlider(produtos)
 {
 	var productsPage = 3;
 	var slides = Math.ceil(produtos/productsPage);
 	checked = 'checked="checked"';
 	var htmlControls = '';
 	for (i = 1; i <= slides; i++) {
 		if (i > 1) {
 			checked = '';  			
 		}
	    htmlControls += '<input '+checked+' class="carousel__activator" id="carousel-slide-activator-'+i+'" name="carousel" type="radio">';
	};
	for (i = 1; i <= slides; i++) {		
		var anterior = parseInt(i) - parseInt(1);
		var proxima = parseInt(i) + parseInt(1);
		if (i > 1 && i < slides) {			  
			htmlControls += `<div class='carousel__controls'>
						      <label class='carousel__control carousel__control--backward' for='carousel-slide-activator-${anterior}'>
						        👈
						      </label>
						      <label class='carousel__control carousel__control--forward' for='carousel-slide-activator-${proxima}'>
						        👉
						      </label>
						    </div>`;
		} else {
			if (i == 1) {
	 			htmlControls += `<div class='carousel__controls'>
							      <label class='carousel__control carousel__control--forward' for='carousel-slide-activator-2'>
							        👉
							      </label>
							    </div>`;  			
	 		}
	 		if (i == slides) {
	 			htmlControls += `<div class='carousel__controls'>
							      <label class='carousel__control carousel__control--backward' for='carousel-slide-activator-${anterior}'>
							        👈
							      </label>
							    </div>`; 
	 		}
		}
	};	

	return htmlControls;
 }


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
	<div class="col-lg-12 product-item">
		<a href="${productReference.detailUrl}" class="text-center">
			<img class="img-responsive" src="${productReference.imageName}" />
			<p class="product-name text-left"> ${productReference.name.slice(0, 80)} ...</p>
			${productReference.oldPrice ? `<p class="old-price text-left"><del> De: <span class="old-price-value">${productReference.oldPrice}</span></del></p>` : ''}
			<p class="price text-left"> Por: <span class="price-value">${productReference.price}</span></p>
			<p class="installment text-left"> ou <span class="installment-parcel">${getInstallment(productReference.price)}</span>x de R$ <span class="installment-value">${getInstallmentValue(getInstallment(productReference.price), productReference.price)}</span></p>
			<p class="no-interest text-left"> sem juros</p>
		</a>
	</div>
	`;


	// Html padrão dos Produtos Recomendados:
	const htmlProductRecommendation = `
	${productRecommendation.map(product => `
	<div class="product-item carousel__item carousel__item--mobile-in-3 carousel__item--tablet-in-3 carousel__item--desktop-in-3">
		<a href="${product.detailUrl}" class="text-center">		
			<img class="img-responsive" src="${product.imageName}" />
			<p class="product-name text-left">${product.name.slice(0, 80)} ...</p>
			${product.oldPrice ? `<p class="old-price text-left"><del> De: <span class="old-price-value">${product.oldPrice}</span></del></p>` : ''}
			<p class="price text-left"> Por: <span class="price-value">${product.price}</span></p>
			<p class="installment text-left"> ou <span class="installment-parcel">${getInstallment(product.price)}</span>x de R$ <span class="installment-value">${getInstallmentValue(getInstallment(product.price), product.price)}</span></p>
			<p class="no-interest text-left"> sem juros</p>
		</a>
	</div>`).join('')} `;


	// Html padrão da Vitrine de Recomendação:
	const htmlVitrine = `
	<div class="row">
		<div class="col-lg-12">
			<h1 class="text-center text-uppercase font-weight-bold">${vitrineTitle}</h1>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
			<div class="row title">
				<div class="col-lg-12">
					<h4 class="font-weight-bold">${productReferenceTitle}</h4>
				</div>
			</div>	
			<div class="row">				
				${htmlProductReference}
			</div>
		</div>
		<div class="col-lg-9 col-md-9 col-sm-6 col-xs-12 recommendation-list-container">
			<div class="row title">
				<div class="col-lg-12">
					<h4 class="font-weight-bold">${productRecommendationTitle}</h4>
				</div>
			</div>
			<div class='row demo-container'>
		  		<div class='carousel'>
					${createControlsSlider(data.data.widget.size)} 
					<div class="carousel__screen">
						<div class="carousel__track">					
							${htmlProductRecommendation}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	`;

	// Insere os valores retornados dentro da div especificada
	document.getElementById("vitrine").innerHTML = htmlVitrine;

}

// Código responsável pela leitura do JSONP
var script = document.createElement('script');
script.src = 'https://cors-anywhere.herokuapp.com/http://roberval.chaordicsystems.com/challenge/challenge.json?callback=X'

document.getElementsByTagName('head')[0].appendChild(script);