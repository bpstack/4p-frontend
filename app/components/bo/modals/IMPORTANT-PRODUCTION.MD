El mock data está en el archivo:

     frontend/app/components/bo/modals/SupplierInvoicesModal.tsx

     Específicamente en las líneas 44-108:
     - generateMockInvoices() función que genera facturas fake (líneas 47-107)
     - Se usa en fetchInvoices() línea 138: setInvoices(generateMockInvoices(supplier.name))

     También hay comentarios // TODO: Descomentar cuando quieras usar la API real en:
     - Línea 133-134: llamada real a backofficeApi.getSupplierById()
     - Línea 233: llamada real a backofficeApi.deleteInvoice()

     Para quitar el mock y usar datos reales, hay que:
     1. Descomentar las líneas 133-134
     2. Comentar/eliminar las líneas 137-138
     3. Descomentar la línea 233
     4. Comentar/eliminar las líneas 236-237
     5. Eliminar el bloque de mock data (líneas 44-108)
