var parameters = {
    inputs: {
        'sku': {'label': 'SKU', "type": 'string'},
        'quantity': {'label': 'Quantity', "type": 'number,positive_number'},
        'billed': {'label': 'Billed', "type": 'number'},
        'difference': {'label': 'Difference', "type": 'number'},
        'subtotal': {'label': 'Subtotal', "type": 'number'},
        'iva': {'label': 'IVA', "type": 'number'},
        'iva2': {'label': 'IVA2', "type": 'number'},
        'total': {'label': 'Total', "type": 'number'},
    },
    primaryKey: 'sku',
    accumulators: {
        'iva':{'message': 'Total IVA amount:'},
        'subtotal':{'message': 'Total Subtotal Amount'},
        'total':{'message':'Total to be requested:'},
    }
};

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
                template += '<td>'+data[key]+'</td>';
        });
    template+='</tr>';
    return template;
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
    var input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.setAttribute('id', key);
    input.addEventListener('focusout',function (e) {getValidation(config.type, e.target)});
    div.appendChild(label);
    div.appendChild(input);
    return div;
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