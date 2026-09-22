import { Request, Response } from 'express';
import { searchService, SearchService } from './search.service';

export class SearchController {
  constructor(private service: SearchService = searchService) {}

  search = async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const data = await this.service.search(q);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('Unhandled Search Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}

export const searchController = new SearchController();
