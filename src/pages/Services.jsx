import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Services() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load Error:", error);
      return;
    }

    setServices(data || []);
  }

  async function addService() {
    if (!name || !price) {
      alert("Please enter service name and price");
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          name: name,
          price: Number(price),
        },
      ])
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Service added successfully");

    setName("");
    setPrice("");

    await loadServices();
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Services Manager</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Service Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={addService}>
          Add Service
        </button>
      </div>

      <table
        width="100%"
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan="3">No services found</td>
            </tr>
          ) : (
            services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.price}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}