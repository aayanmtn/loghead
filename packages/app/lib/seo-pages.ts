import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface SEOPageData {
  slug: string;
  title: string;
  description: string;
  problemTitle: string;
  problemDescription: string;
  solutionSteps: {
    title: string;
    code?: string;
    description: string;
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
    diagram: {
      startLabel: string;
      middleLabel: string;
      endLabel: string;
      insight: string;
    };
  };
}

const solutionsDirectory = path.join(process.cwd(), 'content/solutions');

export async function getSolutionBySlug(slug: string): Promise<SEOPageData | null> {
  try {
    const fullPath = path.join(solutionsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      problemTitle: data.problemTitle,
      problemDescription: data.problemDescription,
      solutionSteps: data.solutionSteps,
      keywords: data.keywords,
      content, // Return raw content for react-markdown
      visuals: data.visuals
    };
  } catch (error) {
    console.error(`Error reading solution file: ${slug}`, error);
    return null;
  }
}

export async function getAllSolutions(): Promise<SEOPageData[]> {
  if (!fs.existsSync(solutionsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(solutionsDirectory);
  const allSolutionsData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const solution = await getSolutionBySlug(slug);
        return solution;
      })
  );

  // Filter out nulls
  return allSolutionsData.filter((item): item is SEOPageData => item !== null);
}
