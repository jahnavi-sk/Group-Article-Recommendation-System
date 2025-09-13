import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from wordcloud import WordCloud
from matplotlib.backends.backend_pdf import PdfPages
import ast
import re

# Load the CSV data
file_path = "./openalex_authors.csv"
df = pd.read_csv(file_path)

# Set the style for better-looking visualizations
plt.style.use('fivethirtyeight')
sns.set_palette('colorblind')

def analyze_authors():
    """Generate visualizations for the authors data and save in a PDF"""
    with PdfPages("author_analysis.pdf") as pdf:
        
        # 1. Distribution of works count
        plt.figure(figsize=(12, 6))
        sns.histplot(df['works_count'].dropna(), bins=30, kde=True)
        plt.title('Distribution of Works Count Among Authors')
        plt.xlabel('Number of Works')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 2. Distribution of H-index
        plt.figure(figsize=(12, 6))
        sns.histplot(df['h_index'].dropna(), bins=30, kde=True)
        plt.title('Distribution of H-index Among Authors')
        plt.xlabel('H-index')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 3. Works vs Citations scatter plot
        plt.figure(figsize=(12, 8))
        plt.scatter(df['works_count'], df['cited_by_count'], alpha=0.5)
        plt.xscale('log')
        plt.yscale('log')
        plt.xlabel('Number of Works (log scale)')
        plt.ylabel('Number of Citations (log scale)')
        plt.title('Citation Impact: Works vs Citations')
        
        # Add trendline
        valid_data = df[(df['works_count'] > 0) & (df['cited_by_count'] > 0)]
        if not valid_data.empty:
            z = np.polyfit(np.log10(valid_data['works_count']), np.log10(valid_data['cited_by_count']), 1)
            p = np.poly1d(z)
            x_range = np.logspace(0, np.log10(df['works_count'].max()), 100)
            plt.plot(x_range, 10**p(np.log10(x_range)), "r--", alpha=0.8)
        
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 4. H-index vs I10-index correlation
        plt.figure(figsize=(10, 8))
        sns.scatterplot(x=df['h_index'], y=df['i10_index'], alpha=0.5)
        plt.title('Correlation between H-index and I10-index')
        plt.xlabel('H-index')
        plt.ylabel('I10-index')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 5. Distribution of citations per work
        plt.figure(figsize=(12, 6))
        # Avoid division by zero
        df['citations_per_work'] = df['cited_by_count'] / df['works_count'].replace(0, np.nan)
        sns.histplot(df['citations_per_work'].dropna(), bins=30, kde=True)
        plt.title('Distribution of Citations Per Work')
        plt.xlabel('Citations Per Work')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 6. Top institutions by author count
        plt.figure(figsize=(12, 8))
        # Count non-empty institution values
        institutions = df['last_known_institution'].dropna()
        institutions = institutions[institutions != '']
        if not institutions.empty:
            top_institutions = institutions.value_counts().head(15)
            sns.barplot(y=top_institutions.index, x=top_institutions.values)
            plt.title('Top 15 Institutions by Author Count')
            plt.xlabel('Number of Authors')
            plt.tight_layout()
            pdf.savefig()
            plt.close()
        
        # 7. Process x_concepts for analysis
        # Extract concept names from the x_concepts field
        concept_names = []
        pattern = r"https://openalex.org/C(\d+)"
        
        # Function to extract concept IDs from the semicolon-separated format
        def extract_concepts(concept_str):
            if not isinstance(concept_str, str) or not concept_str:
                return []
            
            concepts = []
            for item in concept_str.split(';'):
                if ':' in item:
                    concept_id = item.split(':')[0]
                    match = re.search(pattern, concept_id)
                    if match:
                        concepts.append(match.group(0))
            return concepts
        
        # Apply extraction to all authors
        all_concepts = []
        for concepts in df['x_concepts'].dropna():
            extracted = extract_concepts(concepts)
            all_concepts.extend(extracted)
        
        if all_concepts:
            # Create a concept frequency dictionary
            concept_freq = {}
            for concept in all_concepts:
                if concept in concept_freq:
                    concept_freq[concept] += 1
                else:
                    concept_freq[concept] = 1
            
            # 8. Top research concepts
            plt.figure(figsize=(12, 8))
            top_concepts = pd.Series(concept_freq).sort_values(ascending=False).head(15)
            sns.barplot(x=top_concepts.values, y=top_concepts.index)
            plt.title('Top 15 Research Concepts')
            plt.xlabel('Frequency')
            plt.tight_layout()
            pdf.savefig()
            plt.close()
            
            # 9. Word cloud of research concepts
            plt.figure(figsize=(12, 8))
            wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(concept_freq)
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.title('Research Concepts Word Cloud')
            plt.tight_layout()
            pdf.savefig()
            plt.close()
        
    print("Visualizations saved in author_analysis.pdf.")

# Run the analysis
if __name__ == "__main__":
    analyze_authors()