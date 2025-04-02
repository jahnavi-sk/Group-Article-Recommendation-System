import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.backends.backend_pdf import PdfPages

def visualize_csv_data(csv_file, output_pdf):
    df = pd.read_csv(csv_file)
    
    with PdfPages(output_pdf) as pdf:
        fig_size = (12, 10)  # Standard size for all plots
        
        # Plot 1: Publication Trend Over Years
        plt.figure(figsize=fig_size)
        df['publication_date'] = pd.to_datetime(df['publication_date'], errors='coerce')
        df['year'] = df['publication_date'].dt.year
        df['year'].value_counts().sort_index().plot(kind='line', marker='o')
        plt.title("Publication Trend Over Years")
        plt.xlabel("Year")
        plt.ylabel("Number of Publications")
        pdf.savefig()
        plt.close()
        
        # Plot 2: Citation Trend Over Years
        plt.figure(figsize=fig_size)
        df.groupby('year')['summary_cited_by_count'].sum().plot(kind='line', marker='o')
        plt.title("Citation Trend Over Years")
        plt.xlabel("Year")
        plt.ylabel("Total Citations")
        pdf.savefig()
        plt.close()
        
        # Plot 3: Concept Frequency Distribution
        plt.figure(figsize=fig_size)
        concepts_flat = df['concepts'].dropna().str.split(', ').explode()
        concepts_flat.value_counts().nlargest(10).plot(kind='bar')
        plt.title("Top 10 Most Frequent Concepts")
        plt.xlabel("Concept")
        plt.ylabel("Frequency")
        pdf.savefig()
        plt.close()
        
        # Plot 4: Open Access vs Non-Open Access Publications
        plt.figure(figsize=fig_size)
        df['open_access'].value_counts().plot(kind='pie', autopct='%1.1f%%', startangle=90, colors=['lightblue', 'lightcoral'])
        plt.title("Open Access vs Non-Open Access Publications")
        pdf.savefig()
        plt.close()
        
        # Plot 5: Authors Count Distribution
        plt.figure(figsize=fig_size)
        sns.histplot(df['authors_count'], bins=30, kde=True)
        plt.title("Distribution of Authors Count")
        plt.xlabel("Authors Count")
        plt.ylabel("Frequency")
        pdf.savefig()
        plt.close()
        
        # Plot 6: Concepts Count vs Citations
        plt.figure(figsize=fig_size)
        sns.scatterplot(x=df['concepts_count'], y=df['summary_cited_by_count'])
        plt.title("Concepts Count vs Citations")
        plt.xlabel("Concepts Count")
        plt.ylabel("Cited By Count")
        pdf.savefig()
        plt.close()
        
        # Plot 7: Top 10 Most Referenced Works
        plt.figure(figsize=fig_size)
        df.nlargest(10, 'referenced_works_count')[['display_name', 'referenced_works_count']].set_index('display_name').plot(kind='bar')
        plt.title("Top 10 Most Referenced Works")
        plt.xlabel("Work")
        plt.ylabel("Referenced Count")
        pdf.savefig()
        plt.close()
        
        # Plot 8: Correlation Heatmap
        plt.figure(figsize=fig_size)
        sns.heatmap(df[['authors_count', 'concepts_count', 'summary_cited_by_count']].corr(), annot=True, cmap='coolwarm')
        plt.title("Correlation Heatmap")
        pdf.savefig()
        plt.close()
        
        # Plot 9: Top Languages in Research
        plt.figure(figsize=fig_size)
        df['language'].value_counts().nlargest(10).plot(kind='bar')
        plt.title("Top 10 Languages in Research")
        plt.xlabel("Language")
        plt.ylabel("Count")
        pdf.savefig()
        plt.close()
        
        # Plot 10: Histogram of Citation Counts
        plt.figure(figsize=fig_size)
        sns.histplot(df['summary_cited_by_count'], bins=30, kde=True)
        plt.title("Histogram of Citation Counts")
        plt.xlabel("Cited By Count")
        plt.ylabel("Frequency")
        pdf.savefig()
        plt.close()
    
    print(f"Visualization saved to {output_pdf}")

# Example usage
visualize_csv_data("E:/CAPSTONE/DATA_3/works/openalex_works.csv", "works_analysis.pdf")
