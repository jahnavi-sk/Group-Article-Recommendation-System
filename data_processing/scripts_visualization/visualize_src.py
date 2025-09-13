import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

# Load the CSV data
file_path = "./openalex_sources.csv"
df = pd.read_csv(file_path, low_memory=False)

# Set the style for better-looking visualizations
plt.style.use('fivethirtyeight')
sns.set_palette('colorblind')

def analyze_sources():
    """Generate visualizations for the sources data and save in a PDF"""
    with PdfPages("sources_analysis.pdf") as pdf:
        
        # 1. Top sources by works count
        plt.figure(figsize=(12, 6))
        top_sources = df.groupby('display_name')['works_count'].sum().sort_values(ascending=False).head(10)
        sns.barplot(x=top_sources.values, y=top_sources.index)
        plt.title('Top 10 Sources by Number of Works')
        plt.xlabel('Total Works Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()

        
        
        # 2. Citation Impact
        plt.figure(figsize=(12, 8))
        plt.scatter(df['works_count'], df['cited_by_count'], alpha=0.5)
        plt.xscale('log')
        plt.yscale('log')
        plt.xlabel('Number of Works (log scale)')
        plt.ylabel('Number of Citations (log scale)')
        plt.title('Citation Impact: Works vs Citations')
        z = np.polyfit(np.log10(df['works_count']+1), np.log10(df['cited_by_count']+1), 1)
        p = np.poly1d(z)
        x_range = np.logspace(0, np.log10(df['works_count'].max()), 100)
        plt.plot(x_range, 10**p(np.log10(x_range)), "r--", alpha=0.8)
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 3. H-index distribution
        plt.figure(figsize=(12, 6))
        sns.histplot(df['h_index'].dropna(), bins=30)
        plt.title('Distribution of H-index Across Sources')
        plt.xlabel('H-index')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
        # 4. Open Access Analysis
        plt.figure(figsize=(10, 6))
        if 'is_oa' in df.columns:
            oa_counts = df['is_oa'].value_counts()
            plt.pie(oa_counts, labels=['Open Access', 'Not Open Access'], autopct='%1.1f%%', startangle=90, colors=['#5cb85c', '#d9534f'])
            plt.title('Proportion of Open Access Sources')
            plt.tight_layout()
            pdf.savefig()
            plt.close()
        
        # 5. Citations per Work Distribution
        plt.figure(figsize=(12, 6))
        df['citations_per_work'] = df['cited_by_count'] / df['works_count']
        sns.histplot(df['citations_per_work'].dropna(), bins=50, kde=True)
        plt.title('Distribution of Citations Per Work')
        plt.xlabel('Citations Per Work')
        plt.ylabel('Count')
        plt.tight_layout()
        pdf.savefig()
        plt.close()
        
    print("Visualizations saved in sources_analysis.pdf.")

# Run the analysis
if __name__ == "__main__":
    analyze_sources()
