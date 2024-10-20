const socket = io();

socket.on("productsChange", (products) => {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <p><b>${product.title}</b> - UYU$ ${product.price}</p>
        <button class="deleteButton" data-product-id="${product._id}">Eliminar
          producto
        </button>
    `;
    productList.appendChild(li);
  });
});

// delete button logic
document.getElementById("productList").addEventListener("click", (event) => {
  if (event.target.classList.contains("deleteButton")) {
    const productId = event.target.getAttribute("data-product-id");
    fetch(`/api/products/${productId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        event.target.closest("li").remove();
      } else {
        console.error("Failed to delete product");
      }
    });
  }
});
