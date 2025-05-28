export {};

declare global {
  interface GapiClientFitness {
    users: {
      dataset: {
        aggregate: (params: {
          userId: string;
          resource: any;
        }) => Promise<any>;
      };
    };
  }

  interface GapiClient {
    fitness: GapiClientFitness;
  }

  interface Window {
    gapi: typeof gapi;
  }

  namespace gapi {
    const client: GapiClient;
  }
}
