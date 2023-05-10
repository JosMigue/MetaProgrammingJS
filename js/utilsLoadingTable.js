var parameters = {
    inputs: {
        'primary': {'label': 'Key', "type": 'string', 'format':'string', "order": 1},
        'sku': {'label': 'SKU', "type": 'string', 'format':'string', "order": 2},
        'quantity': {'label': 'Quantity', "type": 'number,positive_number', 'format':'number', "order": 4},
        'billed': {'label': 'Billed', "type": 'number', 'format':'money', "order": 5},
        'difference': {'label': 'Difference', "type": 'number', 'format':'money', "order": 6},
        'subtotal': {'label': 'Subtotal', "type": 'number', 'format':'money', "order": 8},
        'iva': {'label': 'IVA', "type": 'number', 'format':'money', "order": 7},
        'total': {'label': 'Total', "type": 'number', 'format':'money', "order": 9},
        'currency':{'label': 'Currency', 'type':'selectbox', 'format':'string', 'order':3, "options":{
                'MXN':{'label': 'MXN'},
                'USD':{'label': 'USD'}
            }
        }
    },
    primaryKey: 'primary',
    accumulators: {
        'iva':{'message': 'Total IVA amount:'},
        'subtotal':{'message': 'Total Subtotal Amount'},
        'total':{'message':'Total to be requested:'},
    },
    table_name: 'Test name'
};

var test= {
    "inputs":{
        "name":{"label":"Name","type":"string","format":"string", "order":2},
        "invoice_amount":{"label":"Invoice amount","type":"number","format":"money", "order":4},
        "claim_amount":{"label":"Claim amount","type":"number","format":"money","order":5},
        "payment":{"label":"Payment","type":"number","format":"money","order":6},
        "total_to_apply":{"label":"Total to Apply","type":"number","format":"money", "order":7},
        'currency':{'label': 'Invoice Currency', 'type':'selectbox','format':'string','order':3, 
            "options":{
                'MXN':{'label': 'MXN'},
                'USD':{'label': 'USD'}
            },
        },
        'document_type':{'label': 'Document Type', 'type':'selectbox', 'format':'string', 'order':1,
            "options":{
                'Invoice':{'label': 'Invoice'}, 
                'Credit note':{'label': 'Credit note'},
                'Debit note':{'label': 'Debit note'}
            }
        }
},
"primaryKey":"name",
"accumulators":{
    "invoice_amount":{
        "message":"Total Invoice Amount:"
    },
    "claim_amount":{
        "message":"Total claim amount"
    },
    "payment":{
        "message":"Total Payment:"
    },
    "total_to_apply":{
        "message":"Total to be applie:"
    }
}};
var config = {
    errors : {
        "number": ":input must be a number",
        "string": ":input must be a string",
        "number,positive_number": ":input must be a number greater than zero"
    }
}

var items  = {};
var accumulators = {};
setup(parameters);

function sortObjects(obj){
    const order = [], res = {};
    Object.keys(obj).forEach(key => {
        return order[obj[key]['order'] - 1] = key;
    });
    order.forEach(key => {
        res[key] = obj[key];
    });
    return res;
}

function saveData(stayInModal){
    var primary = document.getElementById(parameters.primaryKey).value;
    items[primary] = {};
    Object.keys(parameters.inputs).forEach(function(key){
        if(key != parameters.primaryKey){
            items[primary][key] = document.getElementById(key).value;
        }
    });
    renderTable();
    if(!stayInModal){
        $('#myModal').modal('hide');
    }
    resetFields();
}
function editItem(primaryKey){
    $('#myModal').modal('show');
    document.getElementById(parameters.primaryKey).value = primaryKey;
    document.getElementById(parameters.primaryKey).disabled = true;
    Object.keys(parameters.inputs).forEach(function(key){
        if(key != parameters.primaryKey)
            document.getElementById(key).value = items[primaryKey][key];
    });
}
function deleteItem(primaryKey){
    delete items[primaryKey];
    renderTable();
}

function renderTable(){
    resetData();
    var table = document.getElementById('table-body-data');
    table.innerHTML = '';
    Object.keys(items).forEach(function(key) {
        table.innerHTML += preRenderData(key, items[key]);
        calculateResults(items[key]);
    });
    showAccumulators();
}

function calculateResults(data){
    Object.keys(data).forEach(function(key) {
        if(parameters.accumulators[key]){
            accumulators[key] = parseInt(accumulators[key]) + parseInt(data[key]);
        }
    })
}
function showAccumulators(){
    Object.keys(accumulators).forEach(function(key){
        document.getElementById(key+'-accumulator').innerHTML = moneyFormat(accumulators[key]);
    })
}

function preRenderData(primaryKey,data){
    var template = 
    '<tr>'+ 
        '<td>'+
        '<button type="button" class="btn btn-sm icon-edit" onclick="editItem(\''+primaryKey+'\')"></button>'+
        '<button type="button" class="btn btn-sm icon-cross multi-row-delete-row" onclick="deleteItem(\''+primaryKey+'\')"></button>'+
        '</td>'+
        '<td>'+primaryKey+'</td>';
        Object.keys(parameters.inputs).forEach(function(key){
            if(key != parameters.primaryKey)
                template += '<td>'+formatValue(parameters.inputs[key].format,data[key])+'</td>';
            else
                template += '<td>'+primaryKey + '</td>';
        });
    template+='</tr>';
    return template;
}

function formatValue(type,value){
	var response;
	switch(type){
		case 'money': response = moneyFormat(value);
		break;
		default: response = value;
	}
	return response;

}

function onlyNumbers(input, allowNegativeNumbers) {
    var pattern = "^[0-9]*$";
    if(input.value.match(pattern)){
        if(!allowNegativeNumbers){
            if(!input.value.match('^[1-9][0-9]*$')){
                inCaseOfInputError(input,'number,positive_number');
            }
        }
    }else{
        inCaseOfInputError(input,'number');
    }
}
function inCaseOfInputError(input,type){
    var element = document.getElementById('errors-section');
    element.classList.add('hidden');
    element.classList.remove('hidden');
    element.innerHTML = getMessageError(type,input.id);
    clearField(input.id);
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

function getMessageError(type, id){
    return config.errors[type].replace(':input', id);
}

function clearField(id){
    document.getElementById(id).value = '';
}
function moneyFormat(value){
	if(isNaN(value)){
		value = 0;
	}
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return formatter.format(value);
}   
function resetData(){
    generateAccumulators();
}
function resetFields(){
    document.getElementById(parameters.primaryKey).disabled = false;
    Object.keys(parameters.inputs).forEach(function(key){
        document.getElementById(key).value = '';
    });
}

function setup(parameters){
    document.getElementById('data-table-title').innerText= parameters.table_name ? parameters.table_name : 'Item Loading Table' ;
    parameters.inputs = sortObjects(parameters.inputs);
    var table = document.getElementById('main-table-head');
    var modalBody = document.getElementById('modal-body-row');
    Object.keys(parameters.inputs).forEach(function(key,index){
        table.appendChild(createHeader(parameters.inputs[key].label));
        modalBody.appendChild(createInput(parameters.inputs[key],key));
    });
    generateAccumulators();
}
function createHeader(label){
    var element = document.createElement('th');
    element.textContent = label;
    return element;
}
function createInput(config, key){
    var div = document.createElement('div');
    div.setAttribute('class', 'col-md-6 form-group');
    div.setAttribute('id', 'field-'+key);
    var label = document.createElement('label');
    label.setAttribute('for', key);
    label.setAttribute('class', 'control-label');
    label.textContent = config.label;
    input = createInputElement(config);
    input.setAttribute('class', 'form-control');
    input.setAttribute('id', key);
    input.addEventListener('focusout',function (e) {getValidation(config.type, e.target)});
    div.appendChild(label);
    div.appendChild(input);
    return div;
}

function createInputElement(config){
    var response = '';
    switch(config.type){
        case 'selectbox':
            response = buildSelectElement(config.options);
            break;
        default: response = document.createElement('input');
    }

    return response;
}

function buildSelectElement(data){
    var select = document.createElement('select');
    var option = document.createElement('option');
    option.setAttribute('value', '');
    option.setAttribute('selected','selected');
    option.disabled = true;
    option.textContent = 'Select';
    select.appendChild(option);
    Object.keys(data).forEach(function(key){
        var option = document.createElement('option');
        option.setAttribute('value', key);
        option.textContent = data[key].label;
        select.appendChild(option);
    });
    return select;
}

function getValidation(type,target){
    switch(type){
        case'number': return onlyNumbers(target,true);
        case'number,positive_number': return onlyNumbers(target,false);
        default: return '';
    }
}
function generateAccumulators(){
    var section = document.getElementById('accumulators');
    var div = section.lastElementChild;
    div.innerHTML = '';
    Object.keys(parameters.accumulators).forEach(function(key){
        accumulators[key] = 0;
        var element = document.createElement('p');
        element.innerHTML = parameters.accumulators[key].message + ' <b><span id="'+key+'-accumulator">$0.00</span></b>';
        div.appendChild(element);
    });
}