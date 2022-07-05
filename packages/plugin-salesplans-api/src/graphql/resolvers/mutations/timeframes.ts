import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import {
  ITimeframe,
  ITimeframeDocument
} from '../../../models/definitions/timeframes';

const timeframeMutations = {
  saveTimeframes: async (
    _root: any,
    doc: { update: ITimeframeDocument[]; add: ITimeframe[] },
    { models }: IContext
  ) => {
    return await models.Timeframes.saveTimeframes(doc);
  },

  removeTimeframes: async (_root: any, _id: string, { models }: IContext) => {
    return await models.Timeframes.removeTimeframe(_id);
  }
};

moduleCheckPermission(timeframeMutations, 'manageSalesPlans');

export default timeframeMutations;
