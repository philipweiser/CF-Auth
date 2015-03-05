using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CF_Auth;
using CF_Auth.Models;

public class CarController : ApiController
{
    private SqlConnection conn = null;
    private SqlDataReader rdr = null;
    public IEnumerable<string> GetYears()
    {
        /*GetYears
            GetMakesByYear(year)
         * GetModelsByYearAndMake(year, make)
         * GetTrimsByYearMakeAndModel(year,make,model)
         * GetCarsByYear
         * GetCarsByYearAndMke(year, make)
         * GetCarsBYearMakeAndModel(year, make, model)
         * GetCArsByYearMakeModelAndTrim(year, make, model, trim)
         * GetMakes
         * GetModels
         * GetTrims
         * */
        List<string> retval = new List<string>();
        using (conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
        {
            conn.Open();

            SqlCommand cmd = new SqlCommand("GetYears", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                retval.Add(rdr["model_year"].ToString());
            }
            // close the connection and reader
            if (rdr != null)
            {
                rdr.Close();
            }
            if (conn != null)
            {
                conn.Close();
            }
        }
        return retval;
    }
    public IEnumerable<string> GetMakes(string year)
    {
        List<string> retval = new List<string>();
        using (conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
        {
            conn.Open();

            SqlCommand cmd = new SqlCommand("GetMakesByYear", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add("@year", SqlDbType.NVarChar);
            cmd.Parameters["@year"].Value = year;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                string toAdd = rdr["make"].ToString();
                toAdd = Char.ToUpper(toAdd[0]) + toAdd.Substring(1, toAdd.Length - 1);
                retval.Add(toAdd);
            }
            // close the connection and reader
            if (rdr != null)
            {
                rdr.Close();
            }
            if (conn != null)
            {
                conn.Close();
            }
        }
        return retval;
    }
    public IEnumerable<string> GetModels(string year, string make)
    {
        List<string> retval = new List<string>();
        using (conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
        {
            conn.Open();

            SqlCommand cmd = new SqlCommand("GetModelsByYearAndMake", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add("@year", SqlDbType.NVarChar);
            cmd.Parameters["@year"].Value = year;
            cmd.Parameters.Add("@make", SqlDbType.NVarChar);
            cmd.Parameters["@make"].Value = make;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                retval.Add(rdr["model_name"].ToString());
            }
            // close the connection and reader
            if (rdr != null)
            {
                rdr.Close();
            }
            if (conn != null)
            {
                conn.Close();
            }
        }
        return retval;
    }
    public IEnumerable<string> GetTrims(string year, string make, string model)
    {
        List<string> retval = new List<string>();
        using (conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
        {
            conn.Open();

            SqlCommand cmd = new SqlCommand("GetTrimsByYearAndMakeAndModel", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add("@year", SqlDbType.NVarChar);
            cmd.Parameters["@year"].Value = year;
            cmd.Parameters.Add("@make", SqlDbType.NVarChar);
            cmd.Parameters["@make"].Value = make;
            cmd.Parameters.Add("@model", SqlDbType.NVarChar);
            cmd.Parameters["@model"].Value = model;
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                string toAdd = rdr["model_trim"].ToString();
                if (!toAdd.Equals("") && !toAdd.Equals(null))
                {
                    retval.Add(toAdd);
                }
            }
            // close the connection and reader
            if (rdr != null)
            {
                rdr.Close();
            }
            if (conn != null)
            {
                conn.Close();
            }
        }
        return retval;
    }
    public object GetCar(string year, string make, string model, string trim)
    {
        CarModel retval = new CarModel();
        using (conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
        {
            conn.Open();
            if (trim != "" && trim != null)
            {
                SqlCommand cmd = new SqlCommand("GetCarByYearAndMakeAndModelAndTrim", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@year", SqlDbType.NVarChar);
                cmd.Parameters["@year"].Value = year;
                cmd.Parameters.Add("@make", SqlDbType.NVarChar);
                cmd.Parameters["@make"].Value = make;
                cmd.Parameters.Add("@model", SqlDbType.NVarChar);
                cmd.Parameters["@model"].Value = model;
                cmd.Parameters.Add("@trim", SqlDbType.NVarChar);
                cmd.Parameters["@trim"].Value = trim;
                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    foreach (PropertyInfo propertyInfo in retval.GetType().GetProperties())
                    {
                        if (propertyInfo.CanRead)
                        {
                            propertyInfo.SetValue(retval, rdr[propertyInfo.Name].ToString());
                        }
                    }

                }
            }
            else
            {
                SqlCommand cmd = new SqlCommand("GetCarByYearAndMakeAndModel", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@year", SqlDbType.NVarChar);
                cmd.Parameters["@year"].Value = year;
                cmd.Parameters.Add("@make", SqlDbType.NVarChar);
                cmd.Parameters["@make"].Value = make;
                cmd.Parameters.Add("@model", SqlDbType.NVarChar);
                cmd.Parameters["@model"].Value = model;
                rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    foreach (PropertyInfo propertyInfo in retval.GetType().GetProperties())
                    {
                        if (propertyInfo.CanRead)
                        {
                            propertyInfo.SetValue(retval, rdr[propertyInfo.Name].ToString());
                        }
                    }

                }
            }
            // close the connection and reader
            if (rdr != null)
            {
                rdr.Close();
            }
            if (conn != null)
            {
                conn.Close();
            }
        }
        return retval;
    }
}
