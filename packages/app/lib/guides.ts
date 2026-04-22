import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface GuidePageData {
  slug: string;
  title: string;
  description: string;
  solutionSteps: {
    title: string;
    code?: string;
    description: string;
    image?: string;
    caption?: string;
  }[];
  keywords: string[];
  content: string; // Raw markdown content
  visuals?: {
    terminal: {
      command: string;
      output: string;
      error: string;
      suggestion: string;
    };
  };
}

const guidesDirectory = path.join(process.cwd(), 'content/guides');

export async function getGuideBySlug(slug: string): Promise<GuidePageData | null> {
  try {
    const fullPath = path.join(guidesDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the metadata section
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      solutionSteps: data.solutionSteps,
      keywords: data.keywords,
      content, // Return raw content for react-markdown
      visuals: data.visuals
    };
  } catch (error) {
    console.error(`Error reading guide file: ${slug}`, error);
    return null;
  }
}

export async function getAllGuides(): Promise<GuidePageData[]> {
  if (!fs.existsSync(guidesDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(guidesDirectory);
  const allGuidesData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const guide = await getGuideBySlug(slug);
        return guide;
      })
  );

  // Filter out nulls
  return allGuidesData.filter((item): item is GuidePageData => item !== null);
}
