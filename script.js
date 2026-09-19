// ==========================================
// VARIABLES
// ==========================================

let products = [];
let editingIndex = -1;


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const productName = document.getElementById("productName");

const quantity = document.getElementById("quantity");

const price = document.getElementById("price");

const gst = document.getElementById("gst");

const addProductButton = document.getElementById("addProduct");

const billItems = document.getElementById("billItems");

const subtotalElement = document.getElementById("subtotal");

const totalGSTElement = document.getElementById("totalGST");

const discountInput = document.getElementById("discount");

const grandTotalElement = document.getElementById("grandTotal");

const customerName = document.getElementById("customerName");

const invoiceNumber = document.getElementById("invoiceNumber");

const quantityLabel = document.getElementById("quantityLabel");

const priceLabel = document.getElementById("priceLabel");


// ==========================================
// GENERATE INVOICE NUMBER
// ==========================================

function generateInvoiceNumber() {

    const number = Math.floor(1000 + Math.random() * 9000);

    invoiceNumber.value = `INV-${number}`;
}


// ==========================================
// GET SELECTED PRICING TYPE
// ==========================================

function getPricingType() {

    const selected = document.querySelector(
        'input[name="pricingType"]:checked'
    );

    return selected.value;
}


// ==========================================
// CHANGE LABELS WHEN UNIT / KG CHANGES
// ==========================================

document
    .querySelectorAll('input[name="pricingType"]')
    .forEach(function (radio) {

        radio.addEventListener("change", function () {

            const type = getPricingType();

            if (type === "unit") {

                quantityLabel.textContent = "Quantity";

                priceLabel.textContent = "Price per Unit (₹)";

                quantity.placeholder = "Enter quantity";

            } else {

                quantityLabel.textContent = "Weight (Kg)";

                priceLabel.textContent = "Price per Kg (₹)";

                quantity.placeholder = "Enter weight in kg";

            }

        });

    });


// ==========================================
// ADD PRODUCT
// ==========================================

addProductButton.addEventListener("click", function () {

    const name = productName.value.trim();

    const type = getPricingType();

    const qty = parseFloat(quantity.value);

    const productPrice = parseFloat(price.value);

    const productGST = parseFloat(gst.value) || 0;


    // Validation

    if (name === "") {

        alert("Please enter the product name.");

        return;
    }


    if (isNaN(qty) || qty <= 0) {

        alert("Please enter a valid quantity or weight.");

        return;
    }


    if (isNaN(productPrice) || productPrice < 0) {

        alert("Please enter a valid price.");

        return;
    }


    if (productGST < 0) {

        alert("GST cannot be negative.");

        return;
    }


    // Create product object

    const product = {

        name: name,

        type: type,

        quantity: qty,

        price: productPrice,

        gstRate: productGST

    };


    // Calculate amount

    product.baseAmount = qty * productPrice;

    product.gstAmount =
        product.baseAmount * productGST / 100;

    product.total =
        product.baseAmount + product.gstAmount;


    // Edit existing product

    if (editingIndex !== -1) {

        products[editingIndex] = product;

        editingIndex = -1;

        addProductButton.textContent = "Add Product";

    } else {

        products.push(product);

    }


    clearProductForm();

    renderProducts();

    calculateBill();

});


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts() {

    billItems.innerHTML = "";


    if (products.length === 0) {

        billItems.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    No products added yet.
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(function (product, index) {

        const row = document.createElement("tr");


        const typeText =
            product.type === "unit"
                ? "Unit"
                : "Kg";


        const quantityText =
            product.type === "unit"
                ? product.quantity
                : `${product.quantity} kg`;


        const priceText =
            product.type === "unit"
                ? `₹${product.price.toFixed(2)}/unit`
                : `₹${product.price.toFixed(2)}/kg`;


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>${product.name}</td>

            <td>${typeText}</td>

            <td>${quantityText}</td>

            <td>${priceText}</td>

            <td>${product.gstRate}%</td>

            <td>₹${product.total.toFixed(2)}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editProduct(${index})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${index})"
                >
                    Delete
                </button>

            </td>
        `;


        billItems.appendChild(row);

    });

}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(index) {

    products.splice(index, 1);

    renderProducts();

    calculateBill();

}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(index) {

    const product = products[index];


    productName.value = product.name;

    quantity.value = product.quantity;

    price.value = product.price;

    gst.value = product.gstRate;


    document.querySelector(
        `input[name="pricingType"][value="${product.type}"]`
    ).checked = true;


    editingIndex = index;

    addProductButton.textContent = "Update Product";


    // Update labels

    if (product.type === "unit") {

        quantityLabel.textContent = "Quantity";

        priceLabel.textContent = "Price per Unit (₹)";

    } else {

        quantityLabel.textContent = "Weight (Kg)";

        priceLabel.textContent = "Price per Kg (₹)";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CLEAR PRODUCT FORM
// ==========================================

function clearProductForm() {

    productName.value = "";

    quantity.value = "";

    price.value = "";

    gst.value = "0";

}


// ==========================================
// CALCULATE BILL
// ==========================================

function calculateBill() {

    let subtotal = 0;

    let totalGST = 0;


    products.forEach(function (product) {

        subtotal += product.baseAmount;

        totalGST += product.gstAmount;

    });


    const discount =
        parseFloat(discountInput.value) || 0;


    let grandTotal =
        subtotal + totalGST - discount;


    // Prevent negative total

    if (grandTotal < 0) {

        grandTotal = 0;

    }


    subtotalElement.textContent =
        `₹${subtotal.toFixed(2)}`;


    totalGSTElement.textContent =
        `₹${totalGST.toFixed(2)}`;


    grandTotalElement.textContent =
        `₹${grandTotal.toFixed(2)}`;

}


// ==========================================
// DISCOUNT CHANGE
// ==========================================

discountInput.addEventListener(
    "input",
    calculateBill
);


// ==========================================
// GENERATE BILL / INVOICE
// ==========================================

document
    .getElementById("generateBill")
    .addEventListener("click", function () {


        if (products.length === 0) {

            alert("Please add at least one product.");

            return;
        }


        const customer =
            customerName.value.trim();


        // Show customer

        document.getElementById(
            "customerDisplay"
        ).textContent =
            customer || "Walk-in Customer";


        // Invoice number

        document.getElementById(
            "invoiceDisplay"
        ).textContent =
            invoiceNumber.value;


        // Date

        const today = new Date();

        document.getElementById(
            "dateDisplay"
        ).textContent =
            today.toLocaleDateString("en-IN");


        // Generate invoice products

        const invoiceItems =
            document.getElementById("invoiceItems");


        invoiceItems.innerHTML = "";


        products.forEach(function (product, index) {

            const row =
                document.createElement("tr");


            const typeText =
                product.type === "unit"
                    ? "Unit"
                    : "Kg";


            const quantityText =
                product.type === "unit"
                    ? product.quantity
                    : `${product.quantity} kg`;


            const priceText =
                product.type === "unit"
                    ? `₹${product.price.toFixed(2)}/unit`
                    : `₹${product.price.toFixed(2)}/kg`;


            row.innerHTML = `

                <td>${index + 1}</td>

                <td>${product.name}</td>

                <td>${typeText}</td>

                <td>${quantityText}</td>

                <td>${priceText}</td>

                <td>${product.gstRate}%</td>

                <td>₹${product.total.toFixed(2)}</td>

            `;


            invoiceItems.appendChild(row);

        });


        // Calculate totals

        let subtotal = 0;

        let totalGST = 0;


        products.forEach(function (product) {

            subtotal += product.baseAmount;

            totalGST += product.gstAmount;

        });


        const discount =
            parseFloat(discountInput.value) || 0;


        let grandTotal =
            subtotal + totalGST - discount;


        if (grandTotal < 0) {

            grandTotal = 0;

        }


        // Display totals

        document.getElementById(
            "invoiceSubtotal"
        ).textContent =
            `₹${subtotal.toFixed(2)}`;


        document.getElementById(
            "invoiceGST"
        ).textContent =
            `₹${totalGST.toFixed(2)}`;


        document.getElementById(
            "invoiceDiscount"
        ).textContent =
            `₹${discount.toFixed(2)}`;


        document.getElementById(
            "invoiceGrandTotal"
        ).textContent =
            `₹${grandTotal.toFixed(2)}`;


        // Show invoice

        document.getElementById(
            "invoice"
        ).style.display = "block";


        // Scroll to invoice

        document.getElementById(
            "invoice"
        ).scrollIntoView({
            behavior: "smooth"
        });

    });


// ==========================================
// PRINT BILL
// ==========================================

document
    .getElementById("printBill")
    .addEventListener("click", function () {

        if (products.length === 0) {

            alert("Please add products and generate the bill first.");

            return;
        }


        document.getElementById(
            "invoice"
        ).style.display = "block";


        window.print();

    });


// ==========================================
// CLEAR COMPLETE BILL
// ==========================================

document
    .getElementById("clearBill")
    .addEventListener("click", function () {

        const confirmation =
            confirm("Are you sure you want to clear the bill?");


        if (!confirmation) {

            return;

        }


        products = [];

        editingIndex = -1;


        customerName.value = "";

        discountInput.value = "0";


        addProductButton.textContent =
            "Add Product";


        clearProductForm();

        renderProducts();

        calculateBill();


        document.getElementById(
            "invoice"
        ).style.display = "none";


        generateInvoiceNumber();

    });


// ==========================================
// INITIAL SETUP
// ==========================================

generateInvoiceNumber();

renderProducts();

calculateBill();