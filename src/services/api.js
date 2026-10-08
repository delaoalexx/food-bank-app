import axios from "axios";

export const NODES = {
  comondu: "100.82.181.5:3001",
  lapaz: "100.114.40.70:3002",
  loreto: "100.101.236.118:3003",
  mulege: "100.83.23.115:3004",
};

const API_URL = import.meta.env.VITE_API_URL;
export const CURRENT_NODE = import.meta.env.VITE_CURRENT_NODE || "comondu";
const LOCAL_MODE = import.meta.env.VITE_LOCAL_MODE === "true" || !API_URL;
const STORAGE_KEY = "food-bank-app:local-data:v1";
const api = axios.create({ baseURL: API_URL });

const defaultCategories = [
  { id: 1, nombre: "Perecederos" },
  { id: 2, nombre: "No Perecederos" },
  { id: 3, nombre: "Refrigerados" },
  { id: 4, nombre: "Congelados" },
  { id: 5, nombre: "Bebidas" },
  { id: 6, nombre: "Infantiles" },
  { id: 7, nombre: "Higiene" },
  { id: 8, nombre: "Otros" },
];

const branchProducts = {
  comondu: [
    ["Arroz", 45, "kg", 2],
    ["Frijol", 32, "kg", 2],
    ["Leche", 24, "L", 3],
  ],
  lapaz: [
    ["Atún en lata", 28, "pz", 2],
    ["Pasta", 36, "pz", 2],
    ["Agua", 48, "L", 5],
  ],
  loreto: [
    ["Aceite", 18, "L", 2],
    ["Avena", 22, "kg", 2],
    ["Pañales", 15, "pz", 6],
  ],
  mulege: [
    ["Sardinas", 20, "pz", 2],
    ["Jabón", 30, "pz", 7],
    ["Harina", 25, "kg", 2],
  ],
};

const createInitialData = () => {
  const now = new Date().toISOString();
  const branches = Object.fromEntries(
    Object.entries(branchProducts).map(([key, products]) => [
      key,
      {
        categories: defaultCategories.map((category) => ({ ...category })),
        products: products.map(([nombre, cantidad, unit, categoria_id], index) => ({
          id: index + 1,
          nombre,
          cantidad,
          unit,
          categoria_id,
          categoria: { ...defaultCategories[categoria_id - 1] },
        })),
        beneficiaries:
          key === CURRENT_NODE
            ? [
                {
                  id: 1,
                  nombre: "Familia García",
                  telefono: "6121234567",
                  direccion: "Centro",
                  familia: {
                    telefono: "6121234567",
                    direccion: "Centro",
                    cantidad_miembros: 4,
                  },
                },
                {
                  id: 2,
                  nombre: "Familia López",
                  telefono: "6129876543",
                  direccion: "Colonia del Sol",
                  familia: {
                    telefono: "6129876543",
                    direccion: "Colonia del Sol",
                    cantidad_miembros: 3,
                  },
                },
              ]
            : [],
        donations: [],
        deliveries: [],
        transfers: [],
      },
    ]),
  );

  const localBranch = branches[CURRENT_NODE] || branches.comondu;
  const firstProduct = localBranch.products[0];
  localBranch.transfers.push({
    transferencia_id: 1,
    id: 1,
    origen: CURRENT_NODE,
    destino: Object.keys(NODES).find((branch) => branch !== CURRENT_NODE),
    producto_id: firstProduct.id,
    producto_nombre: firstProduct.nombre,
    producto: { ...firstProduct },
    cantidad: 2,
    aprobacion: "en_espera",
    estado: "PENDIENTE",
    created_at: now,
  });

  return { nextId: 100, branches };
};

const readLocalData = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) {
    const initialData = createInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  return JSON.parse(savedData);
};

const saveLocalData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getLocalBranch = (data, branch = CURRENT_NODE) => {
  const selectedBranch = data.branches[branch];
  if (!selectedBranch) {
    throw new Error(`Sucursal desconocida: ${branch}`);
  }
  return selectedBranch;
};

const nextId = (data) => data.nextId++;
const now = () => new Date().toISOString();

const getLocalDonations = (branch) => {
  const data = readLocalData();
  const selectedBranch = getLocalBranch(data, branch);
  return selectedBranch.donations.map((donation) => ({
    ...donation,
    producto: selectedBranch.products.find(
      (product) => product.id === donation.producto_id,
    ),
  }));
};

const getLocalDeliveries = (branch) => {
  const data = readLocalData();
  const selectedBranch = getLocalBranch(data, branch);
  return selectedBranch.deliveries.map((delivery) => ({
    ...delivery,
    producto: selectedBranch.products.find(
      (product) => product.id === delivery.producto_id,
    ),
    beneficiario: selectedBranch.beneficiaries.find(
      (beneficiary) => beneficiary.id === delivery.beneficiario_id,
    ),
  }));
};

const getLocalTransfers = (branch) => getLocalBranch(readLocalData(), branch).transfers;

export const getProducts = async () => {
  if (LOCAL_MODE) return getLocalBranch(readLocalData()).products;
  try {
    const response = await api.get(`/api/${CURRENT_NODE}/productos`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
};

export const getBranchProducts = async (branch) => {
  if (LOCAL_MODE) return getLocalBranch(readLocalData(), branch).products;
  const host = NODES[branch];
  if (!host) throw new Error(`Sucursal desconocida: ${branch}`);
  const response = await axios.get(
    `http://${host}/api/${branch}/productos`,
    { timeout: 3000 },
  );
  return response.data;
};

export const getReplicaProducts = async () => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    return Object.entries(data.branches)
      .filter(([branch]) => branch !== CURRENT_NODE)
      .flatMap(([branch, selectedBranch]) =>
        selectedBranch.products.map((product) => ({
          id_producto: product.id,
          nombre: product.nombre,
          categoria_id: product.categoria_id,
          banco_origen: branch,
          cantidad: product.cantidad,
          unit: product.unit,
        })),
      );
  }
  try {
    const response = await api.get("/api/red/productos/replica");
    return response.data.productos_red || [];
  } catch (error) {
    console.error("Error obteniendo réplicas:", error);
    return [];
  }
};

export const getBeneficiarios = async () => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const selectedBranch = getLocalBranch(data);
    const deliveries = getLocalDeliveries(CURRENT_NODE);
    return selectedBranch.beneficiaries.map((beneficiary) => ({
      ...beneficiary,
      entregas: deliveries.filter(
        (delivery) => delivery.beneficiario_id === beneficiary.id,
      ),
    }));
  }
  try {
    const response = await api.get(`/api/${CURRENT_NODE}/beneficiarios`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo beneficiarios:", error);
    return [];
  }
};

export const createProduct = async (productData) => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const selectedBranch = getLocalBranch(data);
    const category = selectedBranch.categories.find(
      (item) => item.id === Number(productData.categoria_id),
    );
    const product = {
      ...productData,
      id: nextId(data),
      categoria_id: productData.categoria_id
        ? Number(productData.categoria_id)
        : null,
      categoria: category ? { ...category } : null,
    };
    selectedBranch.products.unshift(product);
    saveLocalData(data);
    return product;
  }
  const response = await api.post(
    `/api/${CURRENT_NODE}/productos`,
    productData,
  );
  return response.data;
};

export const getCategories = async () => {
  if (LOCAL_MODE) return getLocalBranch(readLocalData()).categories;
  const response = await api.get(`/api/${CURRENT_NODE}/categorias`);
  return response.data;
};

export const createCategory = async (name) => {
  if (!name.trim()) throw new Error("El nombre de la categoría es obligatorio.");
  if (!LOCAL_MODE) {
    const response = await api.post(`/api/${CURRENT_NODE}/categorias`, {
      nombre: name.trim(),
    });
    return response.data;
  }

  const data = readLocalData();
  const selectedBranch = getLocalBranch(data);
  if (
    selectedBranch.categories.some(
      (category) => category.nombre.toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    throw new Error("Esa categoría ya existe.");
  }
  const category = { id: nextId(data), nombre: name.trim() };
  selectedBranch.categories.push(category);
  saveLocalData(data);
  return category;
};

export const getDonaciones = async () => {
  if (LOCAL_MODE) return getLocalDonations(CURRENT_NODE);
  try {
    const response = await api.get(`/api/${CURRENT_NODE}/donaciones`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo donaciones:", error);
    return [];
  }
};

export const createDonacion = async ({
  donante,
  producto,
  cantidad,
  unit,
  categoria_id,
}) => {
  const productoCreado = await createProduct({
    nombre: producto,
    cantidad,
    unit,
    categoria_id,
  });

  if (LOCAL_MODE) {
    const data = readLocalData();
    const selectedBranch = getLocalBranch(data);
    const donation = {
      id: nextId(data),
      donante,
      producto_id: productoCreado.id,
      cantidad,
      fecha: now(),
    };
    selectedBranch.donations.unshift(donation);
    saveLocalData(data);
    return {
      ...donation,
      producto: productoCreado,
    };
  }
  const response = await api.post(`/api/${CURRENT_NODE}/donaciones`, {
    donante,
    producto_id: productoCreado.id,
    cantidad,
  });
  return response.data;
};

export const createEntrega = async ({
  beneficiario_id,
  producto_id,
  cantidad,
}) => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const selectedBranch = getLocalBranch(data);
    const product = selectedBranch.products.find(
      (item) => item.id === Number(producto_id),
    );
    const beneficiary = selectedBranch.beneficiaries.find(
      (item) => item.id === Number(beneficiario_id),
    );
    if (!product || !beneficiary || Number(cantidad) > product.cantidad) {
      return null;
    }
    product.cantidad -= Number(cantidad);
    const delivery = {
      id: nextId(data),
      beneficiario_id: beneficiary.id,
      producto_id: product.id,
      cantidad: Number(cantidad),
      fecha: now(),
    };
    selectedBranch.deliveries.unshift(delivery);
    saveLocalData(data);
    return {
      ...delivery,
      producto: { ...product },
      beneficiario: { ...beneficiary },
    };
  }
  try {
    const response = await api.post(`/api/${CURRENT_NODE}/entregas`, {
      beneficiario_id,
      producto_id,
      cantidad,
    });
    return response.data;
  } catch (error) {
    console.error("Error creando entrega:", error);
    return null;
  }
};

export const createFamilia = async (familiaData) => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const selectedBranch = getLocalBranch(data);
    const beneficiary = {
      id: nextId(data),
      nombre: familiaData.nombre,
      telefono: familiaData.telefono,
      direccion: familiaData.direccion,
      familia: {
        telefono: familiaData.telefono,
        direccion: familiaData.direccion,
        cantidad_miembros: Number(familiaData.cantidad_miembros),
      },
      entregas: [],
    };
    selectedBranch.beneficiaries.unshift(beneficiary);
    saveLocalData(data);
    return beneficiary;
  }
  try {
    const response = await api.post(
      `/api/${CURRENT_NODE}/familias`,
      familiaData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creando familia:", error);
    return null;
  }
};

export const requestProduct = async (
  sourceBranchKey,
  productoId,
  cantidad,
  motivo,
) => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const source = getLocalBranch(data, sourceBranchKey);
    const product = source.products.find(
      (item) => item.id === Number(productoId),
    );
    if (!product || Number(cantidad) > product.cantidad) {
      throw new Error("El producto o la cantidad solicitada no está disponible.");
    }
    const transfer = {
      transferencia_id: nextId(data),
      origen: sourceBranchKey,
      destino: CURRENT_NODE,
      producto_id: product.id,
      producto_nombre: product.nombre,
      producto: { ...product },
      cantidad: Number(cantidad),
      motivo,
      aprobacion: "en_espera",
      estado: "PENDIENTE",
      created_at: now(),
    };
    getLocalBranch(data, sourceBranchKey).transfers.push(transfer);
    saveLocalData(data);
    return transfer;
  }
  const response = await axios.post(
    `http://${NODES[sourceBranchKey]}/api/red/productos/enviar`,
    {
      producto_id: productoId,
      cantidad,
      destino: CURRENT_NODE,
      motivo,
    },
  );
  return response.data;
};

export const createSolicitud = async ({
  origen,
  producto_nombre,
  cantidad,
}) => {
  if (LOCAL_MODE) {
    const data = readLocalData();
    const source = getLocalBranch(data, origen);
    const product = source.products.find(
      (item) => item.nombre === producto_nombre,
    );
    if (!product || Number(cantidad) > product.cantidad) {
      throw new Error("El producto o la cantidad solicitada no está disponible.");
    }
    const transfer = {
      transferencia_id: nextId(data),
      origen,
      destino: CURRENT_NODE,
      producto_id: product.id,
      producto_nombre: product.nombre,
      producto: { ...product },
      cantidad: Number(cantidad),
      aprobacion: "en_espera",
      estado: "PENDIENTE",
      created_at: now(),
    };
    source.transfers.push(transfer);
    saveLocalData(data);
    return transfer;
  }
  const response = await api.post("/api/red/productos/solicitar", {
    origen,
    producto_nombre,
    cantidad,
  });
  return response.data;
};

const getRemoteTransfers = async (filter) => {
  const responses = await Promise.all(
    Object.entries(NODES).map(async ([branch, host]) => {
      try {
        const response = await axios.get(
          `http://${host}/api/${branch}/transferencias`,
          { timeout: 3000 },
        );
        return response.data || [];
      } catch {
        console.info(`La sucursal ${branch} no está disponible.`);
        return [];
      }
    }),
  );
  return responses
    .flat()
    .filter(filter)
    .reduce((unique, transfer) => {
      unique.set(transfer.transferencia_id || transfer.id, transfer);
      return unique;
    }, new Map())
    .values();
};

export const getSolicitudesEnviadas = async () => {
  if (LOCAL_MODE) {
    return Object.values(readLocalData().branches)
      .flatMap((branch) => branch.transfers)
      .filter((transfer) => transfer.destino === CURRENT_NODE)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  try {
    return [
      ...(await getRemoteTransfers(
        (transfer) => transfer.destino?.toLowerCase() === CURRENT_NODE.toLowerCase(),
      )),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error("Error obteniendo solicitudes enviadas:", error);
    return [];
  }
};

export const getSolicitudesRecibidas = async () => {
  if (LOCAL_MODE) {
    return Object.values(readLocalData().branches)
      .flatMap((branch) => branch.transfers)
      .filter((transfer) => transfer.origen === CURRENT_NODE)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  try {
    return [
      ...(await getRemoteTransfers(
        (transfer) => transfer.origen?.toLowerCase() === CURRENT_NODE.toLowerCase(),
      )),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error("Error obteniendo solicitudes recibidas:", error);
    return [];
  }
};

const updateTransfer = async (transferenciaId, origen, update) => {
  if (!LOCAL_MODE) return null;
  const data = readLocalData();
  const transfer = Object.values(data.branches)
    .flatMap((branch) => branch.transfers)
    .find(
      (item) =>
        (item.transferencia_id || item.id) === Number(transferenciaId) &&
        item.origen === origen,
    );
  if (!transfer) throw new Error("No se encontró la solicitud.");
  update(data, transfer);
  saveLocalData(data);
  return transfer;
};

export const aprobarSolicitud = async (transferenciaId, origen) => {
  if (LOCAL_MODE) {
    return updateTransfer(transferenciaId, origen, (data, transfer) => {
      const source = getLocalBranch(data, transfer.origen);
      const destination = getLocalBranch(data, transfer.destino);
      const product = source.products.find(
        (item) => item.id === transfer.producto_id,
      );
      if (!product || product.cantidad < transfer.cantidad) {
        throw new Error("No hay existencias suficientes para aprobar la solicitud.");
      }
      product.cantidad -= transfer.cantidad;
      const receivedProduct = destination.products.find(
        (item) => item.nombre === product.nombre,
      );
      if (receivedProduct) {
        receivedProduct.cantidad += transfer.cantidad;
      } else {
        destination.products.unshift({
          ...product,
          id: nextId(data),
          cantidad: transfer.cantidad,
        });
      }
      transfer.aprobacion = "aceptado";
      transfer.estado = "COMPLETADO";
    });
  }
  const response = await axios.post(
    `http://${NODES[origen]}/api/${origen}/transferencias/${transferenciaId}/aprobar`,
  );
  return response.data;
};

export const rechazarSolicitud = async (transferenciaId, origen, motivo) => {
  if (LOCAL_MODE) {
    return updateTransfer(transferenciaId, origen, (_data, transfer) => {
      transfer.aprobacion = "denegado";
      transfer.estado = "RECHAZADO";
      transfer.error = motivo;
    });
  }
  const response = await axios.post(
    `http://${NODES[origen]}/api/${origen}/transferencias/${transferenciaId}/rechazar`,
    { motivo },
  );
  return response.data;
};

export const getEntregas = async () => {
  if (LOCAL_MODE) return getLocalDeliveries(CURRENT_NODE);
  try {
    const response = await api.get(`/api/${CURRENT_NODE}/entregas`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo entregas:", error);
    return [];
  }
};

export const getTransferencias = async () => {
  if (LOCAL_MODE) return getLocalTransfers(CURRENT_NODE);
  try {
    const response = await api.get(`/api/${CURRENT_NODE}/transferencias`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo transferencias:", error);
    return [];
  }
};
