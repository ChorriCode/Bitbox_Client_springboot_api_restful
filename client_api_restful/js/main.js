var token;
var user;
var host = 'http://localhost:8080/api/';

$(document).ready(function () {
    $('#login_view').toggleClass("d-none");
    $('#btn_login').click(function () {
        login();
    });

    buttonNewItemView();
    buttonItemsListView();
    buttonSuppliersListView();
    buttonNewSupplierView();


});

// EVENT ALL EDIT SUPPLIERS BUTTON
let buttonsUpdateSuppliers = function() {
    $('#supplier_list_view tr button').each(function( index, element ) {
        let id = "#"+ $(this).attr('id');
        console.log(index, element.id);
        let supplierId = this.id.split("-")[1];
        $(id).click(function () {
                if(this.innerHTML == 'save') {

                let inputs = $("#tr_edit_supplier_id-" + supplierId + " input");
                let suplierName = inputs[0].value;
                let suplierCountry = inputs[1].value;
                let supplierJson = {
                    "id" : supplierId,
                    "name" : suplierName,
                    "country" : suplierCountry
                }
                updateSupplier(supplierJson);
                resetAllEditSupplierButtons();
            } else if (this.innerHTML == 'delete') {
                    let deleteConfirm = confirm("are you sure to delete?");
                    if (deleteConfirm) {
                        console.log("borrando..." + supplierId);
                        deleteSupplier(supplierId);
                    } else {
                        return false;
                    }
                }else {
                changeInputToEditSupplier(this);
            }
        });
    });
}

// SHOW MENU CREATE NEW ITEM
let buttonNewItemView = function() {
    $('#btn_new_item_view').click(function () {
        showSectionWithId('item_new_view');
    });
}

// SHOW LIST ALL SUPPLIERS
let buttonSuppliersListView = function() {
    $('#btn_suppliers_list_view').click(function () {
        showSectionWithId('suppliers_list_view');
        toggleShowAndHideButton('btn_new_supplier_view','show');
        hideAllSubSections();
        getAllSuppliers();

    });
}

// SHOW LIST ALL ITEMS
let buttonItemsListView = function() {
    $('#btn_items_list_view').click(function () {
        showSectionWithId('items_list_view');
        let items = getAllItems();
        console.log(items);
    });
}

// SHOW MENU CREATE NEW SUPPLIER
let buttonNewSupplierView = function() {
    $('#btn_new_supplier_view').click(function () {
        showSectionWithId('suppliers_list_view');
        showSubSectionWithId('add_supplier_view');
        toggleShowAndHideButton('btn_new_supplier_view','hide');
        showSupplierCreatorNew();

    });
}
// SAVE SUPPLIER FROM MENU NEW SUPPLIER
let buttonNewSupplierAction = function() {
    // BUTTON TO ADD A NEW SUPPLIER
    $('#btn_add_supplier_action').click(function () {
        showSectionWithId('suppliers_list_view');
        hideAllSubSections();
        saveNewSupplier();
        toggleShowAndHideButton('btn_new_supplier_view','show');
        getAllSuppliers();

    });

    // BUTTON TO CANCEL ADD A NEW SUPPLIER
    $('#btn_cancel_add_supplier_action').click(function () {
        showSectionWithId('suppliers_list_view');
        hideAllSubSections();
        toggleShowAndHideButton('btn_new_supplier_view','show');
        getAllSuppliers();

    });


}

function login() {

    $("#error_login_view").css('visibility', 'hidden');
    $("#error_login_view").text('--');
    let targetPath = host + 'login';
    let user = $('#login_user_name').val();
    let password = $('#login_password').val();
    let parameters = {
        'user': user,
        'password': password
    };
    $.ajax({
        url: targetPath,
        method: "post",
        dataType: "html",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
        data: parameters,
        success: function (result) {
            $("#error_login_view").html(result); // result is the HTML text
            objectJsonResult = JSON.parse(result);

            if (objectJsonResult.token == null) {
                $("#error_login_view").css('visibility', 'visible');
                $("#error_login_view").text('error username or password');
            } else {
                token = objectJsonResult.token;
                $("#error_login_view").css('visibility', 'hidden');
                $("#error_login_view").text('--');
                hideAllSections();
                $("#menu_nav").removeClass('d-none');
                showSectionWithId('items_list_view');
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });
}

function getAllItems() {
    let targetPath = host + 'items';

    $.ajax({
        url: targetPath,
        method: "get",
        dataType: "html",
        async: false,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        success: function (result) {
            objectJsonResult = JSON.parse(result);
console.log(objectJsonResult);
            return objectJsonResult;
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });
}

/**** SUPPLIER SECTION ****/


/**** EDIT SUPPLIER AJAX AND VIEW FUNCTIONS ****/

function resetAllEditSupplierButtons() {
    $('#supplier_list_view tr button').each(function( index, e ) {

        //let id = index + 1;
        let supplierId = e.id.split("-")[1];
        let button = $("#btn_edit_supplier_id-" + supplierId);
        let inputs = $("#tr_edit_supplier_id-" + supplierId + " input");
        console.log(inputs);
        inputs[0].setAttribute('readonly',true);
        inputs[1].setAttribute('readonly',true);
        button.text("edit");
        button.removeClass('btn-primary');
        button.addClass('btn-warning');
    });
}
// activate the "inputs" tags to be able to edit the suppliers by removing the "readonly" attributes
function changeInputToEditSupplier(element) {
    let supplierId = element.id.split("-")[1];
    let inputs = $("#tr_edit_supplier_id-" + supplierId + " input");
    let button = $("#btn_edit_supplier_id-" + supplierId);
    button.text("save");
    button.removeClass('btn-warning');
    button.addClass('btn-primary');
    inputs[0].removeAttribute('readonly');
    inputs[0].focus();
    inputs[1].removeAttribute('readonly');
}

function updateSupplier(supplierJson){
    let targetPath = host + 'supplier/' + supplierJson.id;
    let supplierName = $('#supplier_name').val();
    let supplierCountry = $('#supplier_country').val();
    supplierJson = JSON.stringify(supplierJson);
    $.ajax({
        url: targetPath,
        data: supplierJson,
        method: "put",
        dataType: "json",
        async: true,
        cache: false,
        contentType: "application/json; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        success: function (result) {
            objectJsonResult = JSON.parse(result);
            console.log(objectJsonResult);
            //showSuppliersList(objectJsonResult);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });
}

/**** DELETE SUPPLIER AJAX FUNCTION ****/

function deleteSupplier(id) {
    let targetPath = host + 'supplier/' + id;

    $.ajax({
        url: targetPath,
        method: "delete",
        dataType: "html",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        success: function (result) {
            //objectJsonResult = JSON.parse(result);
            console.log(result);
            getAllSuppliers();
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });
}

/**** CREATE NEW SUPPLIER AJAX AND VIEW FUNCTIONS ****/
function showSupplierCreatorNew() {
    let view = getById('supplier_list_view');
    let templateNewSupplier = getById('template_new_supplier');
    let clon = templateNewSupplier.content.cloneNode(true);
    let button = clon.querySelectorAll('button');
    console.log(button)
    button[0].id = 'btn_add_supplier_action';
    button[1].id = 'btn_cancel_add_supplier_action';
    view.innerHTML = "";
    view.appendChild(clon);
    buttonNewSupplierAction(); //event button add supplier assigned
}

function saveNewSupplier(){
    let targetPath = host + 'supplier';
    let supplierName = $('#supplier_name').val();
    let supplierCountry = $('#supplier_country').val();
    let validatedSupplierName = validateData(supplierName);
    let validatedSupplierCountry = validateData(supplierCountry);
    if (validatedSupplierName != "" || validatedSupplierCountry != "") {
        console.log(validatedSupplierName);
        console.log(validatedSupplierCountry);
        return false;
    }

    let supplierJson = {
        "name" : supplierName,
        "country" : supplierCountry
    }
    supplierJson = JSON.stringify(supplierJson);
    $.ajax({
        url: targetPath,
        data: supplierJson,
        method: "post",
        dataType: "json",
        async: false,
        cache: false,
        contentType: "application/json; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        success: function (result) {
            objectJsonResult = JSON.parse(result);
            console.log(objectJsonResult);
            //showSuppliersList(objectJsonResult);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });


}



/**** GET ALL SUPPLIERS AJAX AND VIEW FUNCTIONS ****/

function showSuppliersList(jsonResponse){
    let suppliers = jsonResponse;
    let max = suppliers.length;
    let view = getById('supplier_list_view');
    let templateSuppliersList = getById('template_suppliers_list');
    let fragment = document.createDocumentFragment();
    let clon, supplier, supplierId, supplierName, supplierCountry;
    view.innerHTML = "";
    for(let i = 0 ; i < max; i++) {
        supplier = suppliers[i];
        clon = templateSuppliersList.content.cloneNode(true);
        tagTr = clon.querySelector('#tr_edit_supplier_id');
        editButton = clon.querySelector('#btn_edit_supplier_id');
        deleteButton = clon.querySelector('#btn_delete_supplier_id');

        supplierName = clon.querySelector('.supplier_name');
        supplierCountry = clon.querySelector('.supplier_country');
        // at the end id attribute of the "button" tag I add the "supplierId" to identify it
        tagTr.id = 'tr_edit_supplier_id-' + supplier.id;
        editButton.id = 'btn_edit_supplier_id-' + supplier.id;
        deleteButton.id = 'btn_delete_supplier_id-' + supplier.id;
        supplierName.value = supplier.name;
        supplierCountry.value = supplier.country;
        fragment.appendChild(clon);
    }
    view.appendChild(fragment);
}

function getAllSuppliers() {
    let targetPath = host + 'suppliers';

    $.ajax({
        url: targetPath,
        method: "get",
        dataType: "html",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        success: function (result) {
            objectJsonResult = JSON.parse(result);
            console.log(objectJsonResult);
            showSuppliersList(objectJsonResult);
            buttonsUpdateSuppliers();
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        let errorText = errorManagment(jqXHR, textStatus);
        $("#error_login_view").text(errorText);
        $("#error_login_view").css('visibility', "visible");
    });
}



/**** GENERIC FUNCTIONS ****/

function getById(id) {
    return document.getElementById(id);
}


function errorManagment(jqXHR, textStatus) {
    let errorText = '';
    switch (jqXHR.status) {
        case 404:
            errorText = 'Requested page not found [404]';
            break;
        case 500:
            errorText = 'Internal Server Error [500]';
            break;
        case 0:
            errorText = 'Network or Connection problem';
            break;
    }

    switch (textStatus) {
        case 'parsererror':
            errorText = "Requested JSON parse failed";
            break;
        case 'timeout':
            errorText = "Time out error";
            break;
        case 'abort':
            errorText = "Ajax request aborted";
            break;
    }
    return errorText;
}

//hide all main sections and show one
//main are menu of items, supppliers
function showSectionWithId(id) {
    hideAllSections();
    $("#" + id).removeClass('d-none');
}

function hideAllSections() {
    $('.no-show').each(function(index, element){
        let elementId = element.id;
        $("#" + elementId).addClass('d-none');
    })
}

//hide all sub-sections and show one
//sub-sections are add new supplier...
function showSubSectionWithId(id) {
    hideAllSubSections();
    $("#" + id).removeClass('d-none');
}
function hideAllSubSections() {
    $('.no-show-sub').each(function(index){
        $(this).addClass('d-none');
    })
}

$('.no-show-sub').each(function(index, element){
    console.log(element);
    $(this).addClass('d-none');
})

function toggleShowAndHideButton(elementId, action) {
    if (action == "show") {
        $("#" + elementId).show();
    } else if (action == "hide") {
        $("#" + elementId).hide();
    }

}

function validateData(inputData) {
    let error  = "";
    switch(inputData) {
        case "":
            error = "field cannot be empty";
            break;
        case undefined:
        case null:
            error = "please write data in field";
            break;
    }
    return error;
}