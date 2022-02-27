import { ProductCategories, Products } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('products:rpc_queue:findOne', async (selector) => ({
    data: await Products.findOne(selector),
    status: 'success',
  }));

  consumeRPCQueue(
    'productCategories:rpc_queue:find',
    async ({ query, sort, reg }) => ({
      data: reg
        ? await ProductCategories.find({
            order: { $regex: new RegExp(reg.value) }
          }).sort(sort)
        : await ProductCategories.find(query),
      status: 'success'
    })
  );

  consumeRPCQueue('productCategories:rpc_queue:findOne', async (selector) => ({
    data: await ProductCategories.findOne(selector),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:find', async ({ query, sort }) => ({
    data: await Products.find(query).sort(sort),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:update', async ({ selector, modifier }) => ({
    data: await Products.updateMany(selector, modifier),
    status: 'success',
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const prepareCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:prepareCustomFieldsData', {
    doc,
  });
};

export const findTags = async (selector): Promise<any> => {
  return client.sendRPCMessage('tags:rpc_queue:find', selector);
};

export const findCompanies = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:rpc_queue:findActiveCompanies', selector);
};

export default function() {
  return client;
}
