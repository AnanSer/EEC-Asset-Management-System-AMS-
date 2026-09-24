import { Request, Response } from 'express';
import { searchService, SearchService } from './search.service';
import { successResponse, errorResponse } from '../../lib/api';

export class SearchController {
  constructor(private service: SearchService = searchService) {}

  search = async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const data = await this.service.search(q);

      return res.status(200).json(successResponse(data));
    } catch (err: any) {
      console.error('Unhandled Search Error:', err);
      return res.status(500).json(
        errorResponse('Internal server error', 'INTERNAL_ERROR')
      );
    }
  };
}

export const searchController = new SearchController();

