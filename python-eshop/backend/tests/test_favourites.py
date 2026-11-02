from db.seed import DEMO_EMAIL


def products(client, count=3):
    return client.get("/api/catalog/items").json()["items"][:count]


def save(client, headers, product):
    response = client.put(f"/api/favourites/{product['id']}", headers=headers)
    assert response.status_code == 204, response.text


def listed_ids(client, headers):
    response = client.get("/api/favourites", headers=headers)
    assert response.status_code == 200, response.text
    return [favourite["id"] for favourite in response.json()]


def test_saved_product_is_listed_with_current_details(client, demo_headers):
    product = products(client, 1)[0]

    saved = client.put(f"/api/favourites/{product['id']}", headers=demo_headers)
    assert saved.status_code == 204, saved.text

    listed = client.get("/api/favourites", headers=demo_headers)

    assert listed.status_code == 200
    [favourite] = listed.json()
    assert favourite["id"] == product["id"]
    assert favourite["name"] == product["name"]
    assert favourite["price"] == product["price"]
    assert favourite["picture_uri"] == product["picture_uri"]


def test_saving_an_unknown_product_is_not_found(client, demo_headers):
    response = client.put("/api/favourites/999999", headers=demo_headers)

    assert response.status_code == 404
    assert client.get("/api/favourites", headers=demo_headers).json() == []


def test_new_shopper_has_no_favourites(client, demo_headers):
    assert listed_ids(client, demo_headers) == []


def test_most_recently_saved_favourite_is_listed_first(client, demo_headers):
    first, second, third = products(client)
    for product in (first, second, third):
        save(client, demo_headers, product)

    assert listed_ids(client, demo_headers) == [third["id"], second["id"], first["id"]]


def test_saving_again_adds_no_duplicate_and_keeps_its_place(client, demo_headers):
    first, second, _ = products(client)
    save(client, demo_headers, first)
    save(client, demo_headers, second)

    save(client, demo_headers, first)

    assert listed_ids(client, demo_headers) == [second["id"], first["id"]]


def test_favourites_require_sign_in(client, anon_headers):
    product = products(client, 1)[0]
    url = f"/api/favourites/{product['id']}"

    assert client.get("/api/favourites").status_code == 401
    assert client.put(url).status_code == 401
    assert client.get("/api/favourites", headers=anon_headers).status_code == 401
    assert client.put(url, headers=anon_headers).status_code == 401


def test_basket_id_cannot_address_a_shoppers_favourites(client, demo_headers):
    product = products(client, 1)[0]
    save(client, demo_headers, product)

    for bad in [DEMO_EMAIL, "not-a-uuid", "' OR 1=1 --"]:
        attack = {"X-Basket-Id": bad}
        assert client.get("/api/favourites", headers=attack).status_code == 401, bad
        assert (
            client.put(f"/api/favourites/{product['id']}", headers=attack).status_code
            == 401
        ), bad


def test_shoppers_cannot_see_each_others_favourites(client, demo_headers):
    first, second, _ = products(client)
    registered = client.post(
        "/api/auth/register",
        json={"email": "other@example.com", "password": "hunter22"},
    )
    assert registered.status_code == 200, registered.text
    other_headers = {"Authorization": f"Bearer {registered.json()['access_token']}"}

    save(client, demo_headers, first)
    save(client, other_headers, second)

    assert listed_ids(client, demo_headers) == [first["id"]]
    assert listed_ids(client, other_headers) == [second["id"]]
