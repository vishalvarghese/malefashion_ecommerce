# Male Fashion (Ecommerce App)

Male-fashsion is a fashion Ecommerce Web Application with the functionalities
like login/Signup(Users),OTP(Twilio) with Login,Add to Cart,Wishlist,Wallet,
Checkout,Payment Gateways(Paypal,RazorPay),Profile,Order Management 
and all other basic functionalities of an Ecommerce application.
Also Admin from Other side can manage all the activities in the client 
side with all required functions,Stats,Graphs,Reports and So on...


## API Reference



#### Get HomePage

```http
  GET /malefashion.ml
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get Login/Register

```http
  GET /malefashion.ml/signuplogin
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |




#### Get all Products

```http
  GET /malefashion.ml/shop
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |


#### Get Product Detail of  each Product

```http
  GET /malefashion.ml/productdetails/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |



#### Get cart with purchased products

```http
  GET /malefashion.ml/cart
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**.|Your API key


## Run Locally

Clone the project

```bash
  git clone https://github.com/vishalvarghese/Malefashion.git
```

Go to the project directory

```bash
  cd Malefashion
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## 🚀 About Me
I'm Vishal varghese jans, full stack developer...


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://vishalvarghese.github.io/portfolio/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vishalvjans/)



